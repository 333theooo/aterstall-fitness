"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
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
  "Kroppen väljer. Du gör passen som faktiskt hjälper.",
  "Se hur din kropp har förändrats — dag för dag.",
  "Förstå kopplingen mellan sömn och prestation.",
];

export default function UppgraderaModal({
  onStang,
  onKop,
  defaultPlan = "year",
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
  const yearSublabel = foundingApplicable ? FOUNDING.sublabel : PLANS.year.sublabel;

  const ctaBelopp =
    valdPlan === "year"
      ? `${formatSEK(yearAmount)}/år`
      : `${formatSEK(PLANS.month.amount)}/mån`;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center px-0 sm:px-4 sm:pb-4"
      style={{
        backgroundColor: open ? "rgba(0,0,0,0.58)" : "rgba(0,0,0,0)",
        transition: "background-color 0.35s var(--ease-screen)",
      }}
      onClick={onStang}
    >
      <div
        className="w-full max-w-xl rounded-t-[var(--radius-card)] border border-separator bg-bg-raised p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] sm:rounded-[var(--radius-card)] sm:p-6"
        style={{
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s var(--ease-screen)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-5">
          <div>
            <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
              Premium
            </p>
            <h2 className="mt-2 text-heading text-text-primary">
              Mer variation, samma lugn.
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

        <div className="my-5 grid gap-3">
          {PUNKTER.map((punkt) => (
            <div key={punkt} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-bg-elevated text-accent">
                <Check size={14} strokeWidth={1.7} />
              </span>
              <p className="text-bodysm text-text-primary">{punkt}</p>
            </div>
          ))}
        </div>

        {/* Plan-väljare — årsplan är default */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <PlanKort
            vald={valdPlan === "year"}
            label={foundingApplicable ? FOUNDING.label : PLANS.year.label}
            sublabel={yearSublabel}
            badge={
              foundingApplicable
                ? "Grundarpris"
                : `Bästa värdet · ${PLANS.year.savingsPercent}% rabatt`
            }
            badgeHighlight={!foundingApplicable}
            onClick={() => setValdPlan("year")}
          />
          <PlanKort
            vald={valdPlan === "month"}
            label={PLANS.month.label}
            sublabel={PLANS.month.sublabel}
            onClick={() => setValdPlan("month")}
          />
        </div>

        <Button glow onClick={() => onKop(valdPlan, foundingApplicable)}>
          <span>Lås upp premium</span>
          <span>{ctaBelopp}</span>
        </Button>
        <Button variant="quiet" onClick={onStang} className="mt-2">
          Fortsätt gratis
        </Button>
      </div>
    </div>
  );
}

function PlanKort({
  vald,
  label,
  sublabel,
  badge,
  badgeHighlight = false,
  onClick,
}: {
  vald: boolean;
  label: string;
  sublabel: string;
  badge?: string;
  badgeHighlight?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="press relative flex flex-col gap-1 rounded-[var(--radius-card-inner)] border p-4 text-left"
      style={{
        borderColor: vald ? "var(--accent)" : "var(--separator)",
        backgroundColor: vald ? "var(--accent-soft)" : "var(--bg-elevated)",
        boxShadow: vald ? "0 0 22px var(--accent-glow)" : "none",
        transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {badge && (
        <span
          className={`chip mb-1 self-start text-caption${badgeHighlight ? " animate-glow-pulse" : ""}`}
          style={
            badgeHighlight
              ? { backgroundColor: "var(--accent-soft)", color: "var(--accent)" }
              : undefined
          }
        >
          {badge}
        </span>
      )}
      <span className="text-bodysm font-semibold text-text-primary">{label}</span>
      <span className="text-caption text-text-secondary">{sublabel}</span>
    </button>
  );
}
