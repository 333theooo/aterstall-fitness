import "server-only";

import Stripe from "stripe";
import type { Plan } from "./types";
import { PLANS, FOUNDING } from "./pricing";

const secret = process.env.STRIPE_SECRET_KEY;

export function stripeEnabled(): boolean {
  return Boolean(secret);
}

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!secret) throw new Error("STRIPE_SECRET_KEY saknas.");
  if (!stripe) stripe = new Stripe(secret);
  return stripe;
}

/**
 * Returnerar Stripe price-id för given plan.
 * Väljer grundarpris när FOUNDING.enabled och plan är "year".
 * Läser från lib/pricing.ts — ingen prisinformation hör hemma i denna fil.
 */
export function priceForPlan(plan: Plan, founding = false): string {
  if (plan === "year" && founding && FOUNDING.enabled && FOUNDING.priceId) {
    return FOUNDING.priceId;
  }
  return PLANS[plan].priceId;
}

/** Härleder plan ("year" | "month") från ett Stripe price-id. */
export function planForPriceId(priceId: string): Plan | null {
  if (priceId === PLANS.year.priceId) return "year";
  if (FOUNDING.priceId && priceId === FOUNDING.priceId) return "year";
  if (priceId === PLANS.month.priceId) return "month";
  return null;
}

/** Returnerar true om price-id matchar grundarpriset. */
export function isFoundingPriceId(priceId: string): boolean {
  return Boolean(FOUNDING.priceId && priceId === FOUNDING.priceId);
}

export function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

/** Kontrollerar att en Checkout-session är betald (för att gatea leverans). */
export async function isPaidSession(sessionId: string): Promise<boolean> {
  if (!stripeEnabled() || !sessionId) return false;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    return session.payment_status === "paid";
  } catch {
    return false;
  }
}
