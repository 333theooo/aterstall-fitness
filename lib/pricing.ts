// lib/pricing.ts — ENDA sanningskälla för alla priser, planer och produkter.
// Inga prisvärden (790, 99, 590, 1900) ska existera i komponenter eller routes.
// Läses av både server (price-id) och klient (belopp, labels, formatering).

export const TRIAL_DAYS = 0; // Freemium är vår trial. Sätt >0 för A/B-test.

// ── Formatering ───────────────────────────────────────────────────────────────

/** Formaterar ören till svensk pristext. 79000 → "790 kr". */
export function formatSEK(amountInOre: number): string {
  const kr = amountInOre / 100;
  return `${Number.isInteger(kr) ? kr : kr.toFixed(0)} kr`;
}

// ── Plan-konfiguration ─────────────────────────────────────────────────────────

export interface PlanConfig {
  priceId: string;            // Stripe price-id (tom sträng på klient utan env)
  amount: number;             // öre (Stripes enhet)
  monthlyEquivalent: number;  // öre/mån, för jämförelse i UI
  savingsPercent: number;     // jämfört med månadsplan × 12
  isDefault: boolean;
  label: string;
  sublabel: string;
}

const YEAR_ORE = 79_000;   // 790 kr
const MONTH_ORE = 9_900;   // 99 kr

// savingsPercent: 1 - (790 / (99 × 12)) ≈ 33.5 % → 34 %
const YEAR_SAVINGS = Math.round((1 - YEAR_ORE / (MONTH_ORE * 12)) * 100);
const YEAR_MONTHLY_EQ = Math.round(YEAR_ORE / 12); // 6583 öre ≈ 66 kr/mån

export const PLANS: Record<"year" | "month", PlanConfig> = {
  year: {
    priceId: process.env.STRIPE_PRICE_YEAR ?? "",
    amount: YEAR_ORE,
    monthlyEquivalent: YEAR_MONTHLY_EQ,
    savingsPercent: YEAR_SAVINGS,
    isDefault: true,
    label: "Premium — år",
    sublabel: `${formatSEK(YEAR_ORE)}/år · ${formatSEK(YEAR_MONTHLY_EQ)}/mån`,
  },
  month: {
    priceId: process.env.STRIPE_PRICE_MONTH ?? "",
    amount: MONTH_ORE,
    monthlyEquivalent: MONTH_ORE,
    savingsPercent: 0,
    isDefault: false,
    label: "Premium — månad",
    sublabel: `${formatSEK(MONTH_ORE)}/mån`,
  },
};

// ── Grundarpris ───────────────────────────────────────────────────────────────
// Prislåsning, inte FOMO. Ingen countdown. "Låst så länge du stannar."

export interface FoundingConfig {
  priceId: string;
  amount: number;   // öre
  enabled: boolean;
  label: string;
  sublabel: string;
}

const FOUNDING_ORE = Number(process.env.FOUNDING_AMOUNT_ORE ?? "59000"); // 590 kr

export const FOUNDING: FoundingConfig = {
  priceId: process.env.STRIPE_PRICE_YEAR_FOUNDING ?? "",
  amount: FOUNDING_ORE,
  enabled: process.env.FOUNDING_ENABLED === "true",
  label: "Grundarpris — år",
  sublabel: `${formatSEK(FOUNDING_ORE)}/år · Priset är låst så länge du stannar.`,
};

// ── Protokollet (engångsköp) ──────────────────────────────────────────────────

export const PROTOKOLL = {
  priceId: process.env.STRIPE_PRICE_PROTOKOLL ?? "",
  amount: 1_900, // 19 kr i öre
  label: "Återställningsprotokollet",
  description:
    "Läs kroppens signaler och bygg din återhämtning — hela protokollet.",
} as const;

// ── Kanoniska eventtyper (delas mellan analytics + schema) ───────────────────

export const REVENUE_EVENT_TYPES = [
  "paywall_shown",
  "paywall_dismissed",
  "checkout_started",
  "checkout_completed",
  "subscription_canceled",
  "subscription_paused",
  "payment_failed",
  "payment_recovered",
  "reactivated",
  "protokoll_purchased",
  "bridge_offer_shown",
  "bridge_offer_taken",
] as const;

export type RevenueEventType = (typeof REVENUE_EVENT_TYPES)[number];
