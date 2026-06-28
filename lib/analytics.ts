"use client";

import type { RevenueEventType } from "./pricing";
import { getSupabase, supabaseEnabled } from "./supabase/client";

export interface RevenueEventPayload {
  source?: string;
  amount?: number;
  meta?: Record<string, unknown>;
}

/**
 * Loggar en intäktshändelse från klienten.
 * Kräver att användaren är inloggad (ensureUser körs i loadState).
 * Misslyckas tyst — analys är inte kritisk för UX.
 */
export async function logEvent(
  type: RevenueEventType,
  payload: RevenueEventPayload = {},
): Promise<void> {
  if (!supabaseEnabled()) return;

  const sb = getSupabase();
  if (!sb) return;

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  await sb.from("revenue_events").insert({
    user_id: user.id,
    type,
    source: payload.source ?? "client",
    amount: payload.amount,
    currency: payload.amount != null ? "sek" : null,
    meta: payload.meta ?? {},
  });
}

/**
 * Loggar en anonym händelse (bridge_offer_*) via server-proxy.
 * Används när köparen inte har ett Supabase-session (protokoll-sida).
 */
export async function logAnonEvent(
  type: RevenueEventType,
  meta: Record<string, unknown> = {},
): Promise<void> {
  try {
    await fetch("/api/bridge-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, meta }),
    });
  } catch {
    // Telemetri är icke-kritisk
  }
}
