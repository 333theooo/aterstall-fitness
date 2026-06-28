import {
  baseUrl,
  getStripe,
  priceForPlan,
  stripeEnabled,
} from "@/lib/stripe";
import { getSupabaseAdmin, adminEnabled } from "@/lib/supabase/admin";
import { PLANS, TRIAL_DAYS } from "@/lib/pricing";
import type { Plan } from "@/lib/types";

export const runtime = "nodejs";

// Skapar en Stripe Checkout-session för premium (månad/år).
// Plan = "year" är default (annual-first strategi).
// founding = true → grundarpriset om FOUNDING.enabled (kontrolleras i priceForPlan).
// Verifierar användaren via Supabase access-token — aldrig klient-spoofbar.
// Saknas Stripe-konfig → 501 så klienten faller tillbaka lokalt (dev).
export async function POST(request: Request) {
  if (!stripeEnabled() || !adminEnabled()) {
    return new Response("Stripe ej konfigurerat", { status: 501 });
  }

  let plan: Plan;
  let founding: boolean;
  let accessToken: string | null;
  try {
    const body = (await request.json()) as {
      plan?: Plan;
      founding?: boolean;
      accessToken: string | null;
    };
    plan = body.plan ?? "year"; // annual-first default
    founding = Boolean(body.founding);
    accessToken = body.accessToken;
  } catch {
    return new Response("Felaktig förfrågan", { status: 400 });
  }

  const price = priceForPlan(plan, founding);
  if (!price) {
    return new Response("Pris saknas för plan — konfigurera STRIPE_PRICE_YEAR/MONTH i env.", {
      status: 400,
    });
  }

  const admin = getSupabaseAdmin();

  // Verifiera användaren utifrån token.
  let userId: string | null = null;
  let email: string | undefined;
  if (accessToken) {
    const { data, error } = await admin.auth.getUser(accessToken);
    if (!error && data.user) {
      userId = data.user.id;
      email = data.user.email ?? undefined;
    }
  }
  if (!userId) {
    return new Response("Ej autentiserad", { status: 401 });
  }

  const stripe = getStripe();

  // Återanvänd eller skapa Stripe-kund kopplad till user_id.
  const { data: profil } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  let customerId = profil?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { user_id: userId },
    });
    customerId = customer.id;
    await admin
      .from("profiles")
      .upsert(
        { user_id: userId, stripe_customer_id: customerId },
        { onConflict: "user_id" },
      );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    metadata: { user_id: userId, plan, founding: founding ? "true" : "false" },
    subscription_data: {
      metadata: { user_id: userId, plan },
      ...(TRIAL_DAYS > 0 ? { trial_period_days: TRIAL_DAYS } : {}),
    },
    // Föreslå årsplan som default om månadsval presenterades
    ...(plan === "month"
      ? {}
      : { saved_payment_method_options: { payment_method_save: "disabled" } }),
    success_url: `${baseUrl()}/?premium=klar`,
    cancel_url: `${baseUrl()}/?premium=avbrutet`,
  });

  // Logga checkout_started (telemetri)
  await admin.from("revenue_events").insert({
    user_id: userId,
    type: "checkout_started",
    source: "checkout_route",
    meta: {
      plan,
      founding,
      price_id: price,
      monthly_equivalent: PLANS[plan].monthlyEquivalent,
    },
  });

  return Response.json({ url: session.url });
}
