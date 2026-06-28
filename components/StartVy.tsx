"use client";

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  LockKeyhole,
  Moon,
  Sparkles,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import {
  beraknaStatusResultat,
  STATUS_COPY,
  STATUS_VAR,
} from "@/lib/status";
import { lokalDatum } from "@/lib/streak";
import type { CheckinPost, Plan } from "@/lib/types";
import { energiPct, senasteDagarBars } from "@/lib/historik";
import Screen from "./ui/Screen";
import Card from "./ui/Card";
import Button from "./ui/Button";
import StatTile from "./ui/StatTile";
import BarChart from "./ui/BarChart";
import { PLANS, formatSEK } from "@/lib/pricing";

interface Props {
  history: CheckinPost[];
  premium: boolean;
  streak: number;
  onCheckin: () => void;
  onPass: () => void;
  onInsikter: () => void;
  onPlan: (plan: Plan) => void;
}

function senaste(history: CheckinPost[]) {
  return history.length ? history[history.length - 1] : null;
}

export default function StartVy({
  history,
  premium,
  streak,
  onCheckin,
  onPass,
  onInsikter,
  onPlan,
}: Props) {
  const dagensDatum = lokalDatum();
  const senastePost = senaste(history);
  const harCheckatInIdag = senastePost?.date === dagensDatum;
  const resultat = senastePost ? beraknaStatusResultat(senastePost.svar) : null;
  const status = resultat?.status ?? "gransfall";
  const statusCopy = STATUS_COPY[status];
  const statusFarg = STATUS_VAR[status];
  const energi = harCheckatInIdag && resultat ? energiPct(resultat.poang) : 0;
  const bars = senasteDagarBars(history);
  const somn = senastePost?.svar.somn ?? null;

  // Animate energy bar from 0 on mount so the CSS transition fires
  const [displayEnergy, setDisplayEnergy] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setDisplayEnergy(energi), 80);
    return () => clearTimeout(id);
  }, [energi]);

  return (
    <Screen>
      {/* Header — hälsning + streak-chip */}
      <header className="flex items-end justify-between">
        <div>
          <p className="text-caption uppercase tracking-[0.12em] text-text-tertiary">
            Återställ
          </p>
          <h1 className="mt-1 text-heading text-text-primary">
            {harCheckatInIdag ? "Bra jobbat idag" : "Hej"}
          </h1>
        </div>
        <div className="chip animate-bounce-in delay-3">
          <Flame size={15} strokeWidth={1.8} className="text-accent" />
          <span className="text-bodysm font-semibold text-text-primary">
            {streak || 0}
          </span>
          <span className="text-caption text-text-tertiary">dgr</span>
        </div>
      </header>

      {/* Hero-kort — dagens status + energi-bar */}
      <Card padding="lg" className="animate-enter delay-1 mt-6 overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-caption uppercase tracking-[0.1em] text-text-tertiary">
              Dagens status
            </p>
            <h2
              className="mt-2 text-hero"
              style={{
                color: harCheckatInIdag ? statusFarg : "var(--text-primary)",
              }}
            >
              {harCheckatInIdag ? statusCopy.titel : "Inte klar än"}
            </h2>
          </div>
          {harCheckatInIdag && (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "var(--accent-soft)" }}
            >
              <span
                className="text-subheading font-semibold"
                style={{ color: statusFarg }}
              >
                {energi}
              </span>
            </div>
          )}
        </div>

        <p className="mt-3 max-w-md text-bodysm text-text-secondary sm:text-body">
          {harCheckatInIdag
            ? statusCopy.rad
            : "Svara på tre frågor så visar appen vad kroppen klarar idag."}
        </p>

        {/* Energi-bar med glow */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-caption text-text-tertiary">
            <span>Energinivå</span>
            <span>{harCheckatInIdag ? `${energi}%` : "–"}</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-bg-elevated">
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{
                width: `${harCheckatInIdag ? displayEnergy : 6}%`,
                backgroundColor: harCheckatInIdag
                  ? statusFarg
                  : "var(--separator)",
                boxShadow: harCheckatInIdag
                  ? "0 0 12px var(--accent-glow)"
                  : "none",
              }}
            />
          </div>
        </div>

        {/* Primär CTA */}
        <Button
          align="center"
          glow
          className="mt-5"
          onClick={harCheckatInIdag ? onPass : onCheckin}
        >
          {harCheckatInIdag ? "Visa dagens pass" : "Gör dagens check-in"}
          <ArrowRight size={19} strokeWidth={2} />
        </Button>
        {harCheckatInIdag && (
          <Button variant="quiet" className="mt-2" onClick={onCheckin}>
            Gör check-in igen
          </Button>
        )}
      </Card>

      {/* Statistik-rad */}
      <div className="animate-enter delay-2 mt-3 grid grid-cols-2 gap-3">
        <StatTile
          icon={<Moon size={17} strokeWidth={1.6} />}
          label="Sömn"
          value={somn != null ? String(somn) : "–"}
          unit={somn != null ? "h" : undefined}
        />
        <StatTile
          icon={<Flame size={17} strokeWidth={1.6} />}
          label="Streak"
          value={String(streak || 0)}
          unit="dagar"
        />
      </div>

      {/* Diagram-kort — senaste check-ins */}
      <Card padding="md" className="animate-enter delay-3 mt-3">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-subheading text-text-primary">Senaste dagarna</h3>
          <button
            onClick={onInsikter}
            className="press flex min-h-11 items-center gap-0.5 text-caption text-text-secondary"
          >
            Historik
            <ChevronRight size={14} strokeWidth={1.6} />
          </button>
        </div>
        <BarChart bars={bars} />
      </Card>

      {/* Snabbåtgärder */}
      <div className="animate-enter delay-4 mt-6 grid gap-3 sm:grid-cols-3">
        <ActionCard
          icon={<CheckCircle2 size={18} strokeWidth={1.6} />}
          title="Checka in"
          text="Sömn, trötthet, senaste pass."
          onClick={onCheckin}
        />
        <ActionCard
          icon={<Dumbbell size={18} strokeWidth={1.6} />}
          title="Träna"
          text="Hemma, tyst, utan gymkrav."
          onClick={onPass}
        />
        <ActionCard
          icon={<BarChart3 size={18} strokeWidth={1.6} />}
          title="Följ mönster"
          text="Se hur kroppen svarar."
          onClick={onInsikter}
        />
      </div>

      {/* Premium */}
      <Card padding="md" className="animate-enter delay-5 mt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-caption uppercase tracking-[0.1em] text-text-tertiary">
              {premium ? "Premium" : "Gratis"}
            </p>
            <h3 className="mt-2 text-subheading text-text-primary">
              {premium
                ? "Hela passbanken är upplåst."
                : "Check-in, status och ett pass per nivå ingår."}
            </h3>
          </div>
          {premium ? (
            <Sparkles size={20} strokeWidth={1.6} className="text-accent" />
          ) : (
            <LockKeyhole
              size={20}
              strokeWidth={1.6}
              className="text-text-tertiary"
            />
          )}
        </div>

        {!premium && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => onPlan("year")}
              className="press tile px-4 py-3 text-left"
            >
              <span className="block text-bodysm font-medium text-text-primary">
                Premium år
              </span>
              <span className="text-caption text-text-secondary">
                {formatSEK(PLANS.year.amount)} · hela passbanken
              </span>
            </button>
            <button
              onClick={() => onPlan("month")}
              className="press tile px-4 py-3 text-left"
            >
              <span className="block text-bodysm font-medium text-text-primary">
                Premium månad
              </span>
              <span className="text-caption text-text-secondary">{formatSEK(PLANS.month.amount)}</span>
            </button>
          </div>
        )}
      </Card>
    </Screen>
  );
}

function ActionCard({
  icon,
  title,
  text,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="press lift surface p-4 text-left">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-elevated text-accent">
        {icon}
      </span>
      <p className="mt-3 text-bodysm font-medium text-text-primary">{title}</p>
      <p className="mt-1 text-caption text-text-secondary">{text}</p>
    </button>
  );
}
