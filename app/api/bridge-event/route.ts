import { getSupabaseAdmin, adminEnabled } from "@/lib/supabase/admin";
import { REVENUE_EVENT_TYPES } from "@/lib/pricing";
import type { RevenueEventType } from "@/lib/pricing";

export const runtime = "nodejs";

// Tar emot anonyma intäktshändelser från protokollets tacksida.
// Köparen har inget Supabase user_id → user_id=null i revenue_events.
// Accepterar bara kanoniska event-typer (validering server-side).
export async function POST(request: Request) {
  if (!adminEnabled()) {
    return new Response("ok", { status: 200 }); // tyst fallback i dev
  }

  let type: string;
  let meta: Record<string, unknown>;
  try {
    const body = (await request.json()) as { type: string; meta?: Record<string, unknown> };
    type = body.type;
    meta = body.meta ?? {};
  } catch {
    return new Response("Felaktig förfrågan", { status: 400 });
  }

  if (!(REVENUE_EVENT_TYPES as readonly string[]).includes(type)) {
    return new Response("Okänd event-typ", { status: 422 });
  }

  const admin = getSupabaseAdmin();
  await admin.from("revenue_events").insert({
    user_id: null,
    type: type as RevenueEventType,
    source: "bridge",
    meta,
  });

  return new Response("ok", { status: 200 });
}
