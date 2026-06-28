import { baseUrl, getStripe, stripeEnabled } from "@/lib/stripe";
import { PROTOKOLL } from "@/lib/pricing";

export const runtime = "nodejs";

// Engångsköp av protokollet — anonymt, ingen Supabase. Saknas Stripe → 501.
// Belopp och produktinfo läses från lib/pricing.ts (inga hårdkodade siffror här).
export async function POST() {
  if (!stripeEnabled()) {
    return new Response("Stripe ej konfigurerat", { status: 501 });
  }

  const stripe = getStripe();

  const lineItem = PROTOKOLL.priceId
    ? { price: PROTOKOLL.priceId, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          currency: "sek",
          unit_amount: PROTOKOLL.amount,
          product_data: {
            name: PROTOKOLL.label,
            description: PROTOKOLL.description,
          },
        },
      };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [lineItem],
    allow_promotion_codes: true,
    metadata: { product: "protokoll" },
    success_url: `${baseUrl()}/protokollet/tack?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl()}/protokollet`,
  });

  return Response.json({ url: session.url });
}
