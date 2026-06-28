import type Stripe from "stripe";
import { getStripe, stripeEnabled, planForPriceId, isFoundingPriceId } from "@/lib/stripe";
import { getSupabaseAdmin, adminEnabled } from "@/lib/supabase/admin";
import type { RevenueEventType } from "@/lib/pricing";

export const runtime = "nodejs";

// Stripe-webhook. Premium-flaggan sätts ENDAST här (service role), aldrig
// från klienten. Rå body krävs för signaturverifiering.
//
// Idempotens: varje event.id kontrolleras mot processed_events innan skrivning.
// Samma event kan skickas om av Stripe utan att skapa dubbletter.
export async function POST(request: Request) {
  if (!stripeEnabled() || !adminEnabled()) {
    return new Response("Ej konfigurerat", { status: 501 });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook-secret saknas", { status: 500 });

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "okänt fel";
    return new Response(`Webhook-fel: ${msg}`, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  // ── Idempotens: hoppa över om eventet redan bearbetats ───────────────────
  const { data: already } = await admin
    .from("processed_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();

  if (already) {
    return new Response("already processed", { status: 200 });
  }

  // ── Hjälpfunktioner ──────────────────────────────────────────────────────

  async function userIdForCustomer(customerId: string): Promise<string | null> {
    const { data } = await admin
      .from("profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    return (data?.user_id as string | undefined) ?? null;
  }

  async function logEvent(
    type: RevenueEventType,
    userId: string | null,
    source: string,
    meta: Record<string, unknown> = {},
    amount?: number,
  ) {
    await admin.from("revenue_events").insert({
      user_id: userId,
      type,
      source,
      amount,
      currency: amount != null ? "sek" : null,
      meta,
    });
  }

  async function markProcessed() {
    await admin
      .from("processed_events")
      .upsert({ event_id: event.id }, { onConflict: "event_id" });
  }

  // ── Eventhantering ───────────────────────────────────────────────────────

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const userId =
        (sub.metadata?.user_id as string | undefined) ??
        (await userIdForCustomer(customerId));

      if (userId) {
        const aktiv = sub.status === "active" || sub.status === "trialing";
        const item = sub.items.data[0];
        const priceId = item?.price?.id ?? "";
        const plan = planForPriceId(priceId) ?? null;
        const founding = isFoundingPriceId(priceId);
        // current_period_end is on SubscriptionItem in Stripe v22+
        const rawPeriodEnd = item?.current_period_end;
        const periodEnd = rawPeriodEnd
          ? new Date(rawPeriodEnd * 1000).toISOString()
          : null;

        await admin.from("profiles").upsert(
          {
            user_id: userId,
            premium: aktiv,
            subscription_status: sub.status,
            plan,
            price_id: priceId,
            current_period_end: periodEnd,
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            founding_member: founding,
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

        if (event.type === "customer.subscription.deleted") {
          await logEvent("subscription_canceled", userId, "webhook", {
            status: sub.status,
            plan,
          });
        }
      }
      break;
    }

    case "customer.subscription.paused": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const userId =
        (sub.metadata?.user_id as string | undefined) ??
        (await userIdForCustomer(customerId));

      if (userId) {
        const pauseUntil =
          (sub as unknown as { pause_collection?: { resumes_at?: number } })
            .pause_collection?.resumes_at != null
            ? new Date(
                ((sub as unknown as { pause_collection: { resumes_at: number } })
                  .pause_collection.resumes_at) * 1000,
              ).toISOString()
            : null;

        await admin.from("profiles").upsert(
          {
            user_id: userId,
            subscription_status: "paused",
            pause_until: pauseUntil,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        await logEvent("subscription_paused", userId, "webhook", { pause_until: pauseUntil });
      }
      break;
    }

    case "customer.subscription.resumed": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const userId =
        (sub.metadata?.user_id as string | undefined) ??
        (await userIdForCustomer(customerId));

      if (userId) {
        await admin.from("profiles").upsert(
          {
            user_id: userId,
            subscription_status: sub.status,
            pause_until: null,
            premium: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      }
      break;
    }

    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      const customerId = inv.customer as string;
      const userId = await userIdForCustomer(customerId);

      if (userId) {
        // Premium tas INTE bort direkt — Stripe gör retries.
        // Premium tas bort när subscription status blir "unpaid" eller "canceled"
        // via customer.subscription.updated ovan.
        await admin.from("profiles").upsert(
          {
            user_id: userId,
            last_payment_status: "failed",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
        await logEvent(
          "payment_failed",
          userId,
          "webhook",
          { invoice_id: inv.id, attempt_count: inv.attempt_count },
          inv.amount_due ?? undefined,
        );
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const inv = event.data.object as Stripe.Invoice;
      const customerId = inv.customer as string;
      const userId = await userIdForCustomer(customerId);

      if (userId) {
        // Hämta tidigare status för att avgöra om detta är en recovery
        const { data: profil } = await admin
          .from("profiles")
          .select("last_payment_status")
          .eq("user_id", userId)
          .maybeSingle();

        const wasFailedBefore = (profil?.last_payment_status as string | null) === "failed";

        await admin.from("profiles").upsert(
          {
            user_id: userId,
            last_payment_status: "paid",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

        await logEvent(
          wasFailedBefore ? "payment_recovered" : "checkout_completed",
          userId,
          "webhook",
          { invoice_id: inv.id },
          inv.amount_paid ?? undefined,
        );
      }
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string | null;
      const userId =
        (session.metadata?.user_id as string | undefined) ??
        (customerId ? await userIdForCustomer(customerId) : null);

      // Protokoll-köp (engångsbetalning, inget user_id) loggas separat
      if (session.metadata?.product === "protokoll") {
        await logEvent(
          "protokoll_purchased",
          null,
          "webhook",
          { session_id: session.id },
          session.amount_total ?? undefined,
        );
        break;
      }

      if (userId) {
        await admin.from("profiles").upsert(
          {
            user_id: userId,
            premium: true,
            subscription_status: "active",
            ...(customerId ? { stripe_customer_id: customerId } : {}),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      }
      break;
    }

    default:
      break;
  }

  // Markera eventet som hanterat (idempotens)
  await markProcessed();

  return new Response("ok", { status: 200 });
}
