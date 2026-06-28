"use client";

import { useEffect, useState } from "react";
import { Check, Lock, X } from "lucide-react";
import Button from "./ui/Button";
import { PLANS, FOUNDING, formatSEK } from "@/lib/pricing";
import type { Plan } from "@/lib/types";

interface Props {
  onStang: () => void;
  onKop: (plan: Plan, founding?: boolean) => void;
  defaultPlan?: Plan;
  defaultFounding?: boolean;
  source?: string;
}

const PUNKTER = [
  "Anpassade pass varje dag — baserat på hur kroppen faktiskt mår.",
  "Full historik — se hur din kropp förändras vecka för vecka.",
  "Sömn och prestation synliggjort. Se kopplingen ingen PT visar.",
];

export default function UppgraderaModal({
  onStang,
  onKop,
  defaultPlan = "month",
  defaultFounding = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [valdPlan, setValdPlan] = useState<Plan>(defaultPlan);
  const foundingApplicable = defaultFounding && FOUNDING.enabled;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const yearAmount = foundingApplicable ? FOUNDING.amount : PLANS.year.amount;
  const yearMonthlyEq = foundingApplicable
    ? Math.round(FOUNDING.amount / 12)
    : PLANS.year.monthlyEquivalent;

  const ctaText =
    valdPlan === "year"
      ? `Börja nu — ${formatSEK(yearAmount)}/år`
      : `Börja nu — ${formatSEK(PLANS.month.amount)}/mån`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center px-0 sm:px-4 sm:pb-4"
      style={{
        backgroundColor: open ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0)",
        transition: "background-color 0.35s var(--ease-screen)",
      }}
      onClick={onStang}
    >
      <div
        className="w-full max-w-xl rounded-t-[var(--radius-card)] border border-separator bg-bg-raised p-5 shadow-[0_-12px_40px_rgba(0,0,0,0.6)] sm:rounded-[var(--radius-card)] sm:p-6"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s var(--ease-screen)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-5">
          <div>
            <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
              Premium
            </p>
            <h2 className="mt-1.5 text-heading text-text-primary">
              Hela kroppen. Varje dag.
            </h2>
          </div>
          <button
            onClick={onStang}
            className="press flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-bg-elevated text-text-secondary hover:text-text-primary"
            aria-label="Stäng"
          >
            <X size={19} strokeWidth={1.5} />
          </button>
        </div>

        {/* Feature list */}
        <div className="mb-5 grid gap-2">
          {PUNKTER.map((punkt) => (
            <div key={punkt} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-bg-elevated text-accent">
                <Check size={12} strokeWidth={2} />
              </span>
              <p className="text-bodysm text-text-secondary">{punkt}</p>
            </div>
          ))}
        </div>

        {/* ── Month plan — hero card (low friction, first-week flagship) ── */}
        <button
          onClick={() => setValdPlan("month")}
          className="press relative w-full rounded-[var(--radius-card-inner)] border p-4 text-left"
          style={{
            borderColor: valdPlan === "month" ? "var(--accent)" : "var(--separator)",
            backgroundColor: valdPlan === "month" ? "var(--accent-soft)" : "var(--bg-elevated)",
            boxShadow: valdPlan === "month" ? "0 0 28px var(--accent-glow)" : "none",
            transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-hero font-semibold leading-none text-text-primary">
                {formatSEK(PLANS.month.amount)}
              </p>
              <p className="mt-1 text-bodysm text-text-secondary">
                per månad · avsluta när du vill
              </p>
            </div>
            <div
              className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
              style={{
                borderColor: valdPlan === "month" ? "var(--accent)" : "var(--separator)",
                backgroundColor: valdPlan === "month" ? "var(--accent)" : "transparent",
              }}
            >
              {valdPlan === "month" && (
                <Check size={12} strokeWidth={2.5} style={{ color: "var(--bg)" }} />
              )}
            </div>
          </div>
        </button>

        {/* ── Year plan — secondary, shows savings / founding lock ── */}
        <button
          onClick={() => setValdPlan("year")}
          className="press mt-2 flex w-full items-center justify-between rounded-[var(--radius-card-inner)] border px-4 py-3 text-left"
          style={{
            borderColor: valdPlan === "year" ? "var(--accent)" : "var(--separator)",
            backgroundColor: valdPlan === "year" ? "var(--accent-soft)" : "transparent",
            boxShadow: valdPlan === "year" ? "0 0 16px var(--accent-glow)" : "none",
            transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          <div className="flex items-center gap-3">
            <div>
              <span className="text-body font-semibold text-text-primary">
                {formatSEK(yearAmount)}
              </span>
              <span className="ml-1.5 text-bodysm text-text-secondary">per år</span>
            </div>
            <span
              className="chip text-caption"
              style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {foundingApplicable ? "Grundarpris · låst" : `spara ${PLANS.year.savingsPercent}%`}
            </span>
          </div>
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
            style={{
              borderColor: valdPlan === "year" ? "var(--accent)" : "var(--separator)",
              backgroundColor: valdPlan === "year" ? "var(--accent)" : "transparent",
            }}
          >
            {valdPlan === "year" && (
              <Check size={11} strokeWidth={2.5} style={{ color: "var(--bg)" }} />
            )}
          </div>
        </button>

        {/* CTA */}
        <Button glow className="mt-4" onClick={() => onKop(valdPlan, foundingApplicable)}>
          {ctaText}
        </Button>
        <Button variant="quiet" onClick={onStang} className="mt-2">
          Fortsätt gratis
        </Button>
      </div>
    </div>
  );
}
