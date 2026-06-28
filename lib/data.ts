"use client";

import type { CheckinSvar, Status } from "./status";
import type { AppState, CheckinPost, Plan } from "./types";
import { computeStreak, lokalDatum } from "./streak";
import * as local from "./storage";
import {
  ensureUser,
  getAccessToken,
  getSupabase,
  supabaseEnabled,
} from "./supabase/client";

// ---------------------------------------------------------------------------
// Enhetligt data-API för UI:t. Använder Supabase när konfigurerat, annars
// localStorage (lokal dev/offline). Allt async så samma kod fungerar båda.
// ---------------------------------------------------------------------------

export function isCloud(): boolean {
  return supabaseEnabled();
}

interface CheckinRad {
  date: string;
  status: Status;
  somn: number;
  trotthet: number;
  belastning: CheckinSvar["belastning"];
}

function radTillPost(r: CheckinRad): CheckinPost {
  return {
    date: r.date,
    status: r.status,
    svar: { somn: r.somn, trotthet: r.trotthet, belastning: r.belastning },
  };
}

const NULL_SUBSCRIPTION: Pick<
  AppState,
  "lastPaymentStatus" | "cancelAtPeriodEnd" | "subscriptionStatus" | "hasHadSubscription"
> = {
  lastPaymentStatus: null,
  cancelAtPeriodEnd: false,
  subscriptionStatus: null,
  hasHadSubscription: false,
};

/** Läser hela app-staten (history, streak, premium, prenumerationsdetaljer). */
export async function loadState(): Promise<AppState> {
  if (!supabaseEnabled()) {
    const history = local.getHistory();
    return {
      history,
      streak: local.getStreak(),
      premium: local.getPremium(),
      checkinCount: history.length,
      name: null,
      ...NULL_SUBSCRIPTION,
    };
  }

  const sb = getSupabase();
  const userId = await ensureUser();
  if (!sb || !userId) {
    return { history: [], streak: 0, premium: false, checkinCount: 0, name: null, ...NULL_SUBSCRIPTION };
  }

  const [{ data: rader }, { data: profil }] = await Promise.all([
    sb
      .from("checkins")
      .select("date,status,somn,trotthet,belastning")
      .order("date", { ascending: true }),
    sb
      .from("profiles")
      .select(
        "premium,name,stripe_customer_id,subscription_status,cancel_at_period_end,last_payment_status",
      )
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const history = (rader ?? []).map((r) => radTillPost(r as CheckinRad));

  return {
    history,
    streak: computeStreak(history.map((p) => p.date)),
    premium: Boolean(profil?.premium),
    checkinCount: history.length,
    name: (profil?.name as string | null) ?? null,
    lastPaymentStatus: (profil?.last_payment_status as string | null) ?? null,
    cancelAtPeriodEnd: Boolean(profil?.cancel_at_period_end),
    subscriptionStatus: (profil?.subscription_status as string | null) ?? null,
    // Har haft prenumeration om stripe_customer_id finns men premium=false
    hasHadSubscription:
      Boolean(profil?.stripe_customer_id) && !profil?.premium,
  };
}

/** Sparar dagens incheckning och returnerar uppdaterad state. */
export async function saveCheckin(
  status: Status,
  svar: CheckinSvar,
): Promise<AppState> {
  if (!supabaseEnabled()) {
    local.recordCheckin(status, svar);
    const history = local.getHistory();
    return {
      history,
      streak: local.getStreak(),
      premium: local.getPremium(),
      checkinCount: history.length,
      name: null,
      ...NULL_SUBSCRIPTION,
    };
  }

  const sb = getSupabase();
  const userId = await ensureUser();
  if (sb && userId) {
    await sb.from("checkins").upsert(
      {
        user_id: userId,
        date: lokalDatum(),
        status,
        somn: svar.somn,
        trotthet: svar.trotthet,
        belastning: svar.belastning,
      },
      { onConflict: "user_id,date" },
    );
  }
  return loadState();
}

/**
 * Startar premium-köp. Med Stripe konfigurerat → Checkout-redirect.
 * Utan Stripe (lokal dev) → aktiverar premium lokalt så flödet går att testa.
 *
 * @param plan "year" (default) eller "month"
 * @param founding true = begär grundarpriset (kontrolleras server-side)
 */
export async function startCheckout(
  plan: Plan = "year",
  founding = false,
): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, founding, accessToken: token }),
  });

  if (res.status === 501) {
    // Stripe ej konfigurerat: lokal fallback för demo.
    local.setPremium(true);
    return;
  }

  if (!res.ok) {
    throw new Error("Kunde inte starta köpet.");
  }

  const { url } = (await res.json()) as { url: string };
  window.location.href = url;
}
