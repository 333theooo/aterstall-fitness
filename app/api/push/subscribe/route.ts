import { getSupabaseAdmin, adminEnabled } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Sparar en web-push-prenumeration kopplad till autentiserad användare.
// Kräver access-token — ingen anonym prenumeration accepteras.
export async function POST(request: Request) {
  if (!adminEnabled()) {
    return new Response("Supabase ej konfigurerat", { status: 501 });
  }

  let endpoint: string;
  let p256dh: string;
  let auth: string;
  let accessToken: string | null;
  try {
    const body = (await request.json()) as {
      endpoint: string;
      p256dh: string;
      auth: string;
      accessToken: string | null;
    };
    endpoint = body.endpoint;
    p256dh = body.p256dh;
    auth = body.auth;
    accessToken = body.accessToken;
  } catch {
    return new Response("Felaktig förfrågan", { status: 400 });
  }

  if (!endpoint || !p256dh || !auth) {
    return new Response("Ofullständig prenumerationsdata", { status: 422 });
  }

  const admin = getSupabaseAdmin();
  let userId: string | null = null;
  if (accessToken) {
    const { data, error } = await admin.auth.getUser(accessToken);
    if (!error && data.user) userId = data.user.id;
  }
  if (!userId) return new Response("Ej autentiserad", { status: 401 });

  await admin
    .from("push_subscriptions")
    .upsert({ user_id: userId, endpoint, p256dh, auth }, { onConflict: "user_id,endpoint" });

  return new Response("ok", { status: 200 });
}
