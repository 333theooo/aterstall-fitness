"use client";

import type { CheckinPost } from "./types";

export type PaywallSource = "third_checkin" | "first_vila" | "locked_pass" | "manual";

const LS_SHOWN_AT = "aterstall.paywall.shown_at";
const LS_TRIGGER_PREFIX = "aterstall.paywall.trigger.";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 h

/** True om paywallen visades de senaste 24 timmarna. */
export function paywallCooldownActive(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(LS_SHOWN_AT);
  if (!raw) return false;
  return Date.now() - Number(raw) < COOLDOWN_MS;
}

/** Avgör om paywallen ska visas för en given källa. */
export function shouldShowPaywall(
  checkinCount: number,
  history: CheckinPost[],
  premium: boolean,
  source: PaywallSource,
): boolean {
  if (premium) return false;
  if (paywallCooldownActive()) return false;

  switch (source) {
    case "third_checkin": {
      const alreadyShown = window.localStorage.getItem(LS_TRIGGER_PREFIX + "third_checkin");
      return checkinCount >= 3 && !alreadyShown;
    }
    case "first_vila": {
      const alreadyShown = window.localStorage.getItem(LS_TRIGGER_PREFIX + "first_vila");
      const hasVila = history.some((p) => p.status === "vila");
      return hasVila && checkinCount >= 2 && !alreadyShown;
    }
    case "locked_pass":
      return true; // alltid visa när användaren försöker låsa upp ett pass
    case "manual":
      return true;
    default:
      return false;
  }
}

/** Registrerar att paywallen visades. Sätter cooldown + trigger-minne. */
export function markPaywallShown(source: PaywallSource): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_SHOWN_AT, String(Date.now()));
  if (source === "third_checkin" || source === "first_vila") {
    window.localStorage.setItem(LS_TRIGGER_PREFIX + source, "1");
  }
}
