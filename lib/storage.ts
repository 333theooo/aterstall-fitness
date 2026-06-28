import type { CheckinSvar, Status } from "./status";
import type { CheckinPost } from "./types";
import { computeStreak, lokalDatum } from "./streak";

// ---------------------------------------------------------------------------
// localStorage-lager — fallback när Supabase inte är konfigurerat (lokal dev)
// samt offline-cache. Persistens i moln sker via lib/data.ts → Supabase.
// ---------------------------------------------------------------------------

const HISTORY_KEY = "aterstall.history.v2";
const PREMIUM_KEY = "aterstall.premium.v1";

function laesHistorik(): CheckinPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as CheckinPost[]) : [];
  } catch {
    return [];
  }
}

export function getHistory(): CheckinPost[] {
  return laesHistorik();
}

/** Sparar dagens incheckning lokalt (en post per kalenderdag, senaste vinner). */
export function recordCheckin(status: Status, svar: CheckinSvar): CheckinPost[] {
  const idag = lokalDatum();
  const historik = laesHistorik().filter((p) => p.date !== idag);
  historik.push({ date: idag, status, svar });
  historik.sort((a, b) => a.date.localeCompare(b.date));
  if (typeof window !== "undefined") {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(historik));
  }
  return historik;
}

export function getStreak(): number {
  return computeStreak(laesHistorik().map((p) => p.date));
}

export function getCheckinCount(): number {
  return laesHistorik().length;
}

export function getPremium(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PREMIUM_KEY) === "1";
}

export function setPremium(v: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREMIUM_KEY, v ? "1" : "0");
}
