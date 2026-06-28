import { baseUrl, getStripe, stripeEnabled } from "@/lib/stripe";
import { getSupabaseAdmin, adminEnabled } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Stripe kundportal — hantera/avsluta prenumeration. Verifierar via token.
export async function POST(request: Request) {
  if (!stripeEnabled() || !adminEnabled()) {
    return new Response("Ej konfigurerat", { status: 501 });
  }

  let accessToken: string | null = null;
  try {
    const body = (await request.json()) as { accessToken: string | null };
    accessToken = body.accessToken;
  } catch {
    return new Response("Felaktig förfrågan", { status: 400 });
  }
  if (!accessToken) return new Response("Ej autentiserad", { status: 401 });

  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(accessToken);
  if (error || !data.user) {
    return new Response("Ej autentiserad", { status: 401 });
  }

  const { data: profil } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const customerId = profil?.stripe_customer_id as string | undefined;
  if (!customerId) return new Response("Ingen kund", { status: 400 });

  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl()}/`,
  });

  return Response.json({ url: session.url });
}
