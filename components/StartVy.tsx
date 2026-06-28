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
  Zap,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import {
  beraknaStatusResultat,
  STATUS_COPY,
  STATUS_VAR,
  type CheckinSvar,
  type Plats,
  type Status,
  type Tid,
} from "@/lib/status";
import { lokalDatum } from "@/lib/streak";
import type { CheckinPost, Plan } from "@/lib/types";
import { energiPct, senasteDagarBars } from "@/lib/historik";
import Screen from "./ui/Screen";
import Card from "./ui/Card";
import Button from "./ui/Button";
import BarChart from "./ui/BarChart";
import { PLANS, formatSEK } from "@/lib/pricing";

// Ambient card background per status (rgba, not CSS variable — needed inline)
const STATUS_GLOW: Record<Status, string> = {
  redo: "rgba(198, 241, 53, 0.07)",
  gransfall: "rgba(232, 197, 71, 0.08)",
  vila: "rgba(91, 138, 122, 0.10)",
};

interface Props {
  history: CheckinPost[];
  premium: boolean;
  streak: number;
  name?: string | null;
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
  name,
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
  const somn = harCheckatInIdag ? (senastePost?.svar.somn ?? null) : null;

  const [displayEnergy, setDisplayEnergy] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setDisplayEnergy(energi), 100);
    return () => clearTimeout(id);
  }, [energi]);

  return (
    <Screen>
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          {name ? (
            <>
              <p className="text-subheading text-text-primary">
                <span className="font-light text-text-tertiary">Hej, </span>
                <span className="font-semibold">{name}</span>
              </p>
              <p className="mt-0.5 text-caption text-text-tertiary">{formatDag()}</p>
            </>
          ) : (
            <p className="text-subheading font-medium text-text-primary">{formatDag()}</p>
          )}
        </div>
        <div className="chip animate-bounce-in delay-3">
          <Flame size={15} strokeWidth={1.8} className="text-accent" />
          <span
            className="text-bodysm font-semibold"
            style={{ color: streak > 0 ? "var(--accent)" : "var(--text-primary)" }}
          >
            {streak || 0}
          </span>
          <span className="text-caption text-text-tertiary">dgr</span>
        </div>
      </header>

      {/* ── Hero-kort — dagsstatus ─────────────────────────────────────── */}
      <div
        className="animate-enter delay-1 mt-6 overflow-hidden surface p-5 sm:p-6"
        style={{
          background: harCheckatInIdag
            ? `radial-gradient(ellipse 130% 90% at 110% -5%, ${STATUS_GLOW[status]} 0%, transparent 55%), linear-gradient(145deg, var(--bg-raised), var(--bg))`
            : "linear-gradient(145deg, var(--bg-raised), var(--bg))",
        }}
      >
        {/* Top row: text left, arc gauge right */}
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-caption uppercase tracking-[0.1em] text-text-tertiary">
              Dagsstatus
            </p>
            <h2
              className="mt-2 text-hero font-semibold leading-none"
              style={{
                color: harCheckatInIdag ? statusFarg : "var(--text-primary)",
                textShadow:
                  harCheckatInIdag && status === "redo"
                    ? "0 0 28px var(--accent-glow)"
                    : "none",
              }}
            >
              {harCheckatInIdag ? statusCopy.titel : "—"}
            </h2>
            <p className="mt-2.5 text-bodysm leading-snug text-text-secondary">
              {harCheckatInIdag
                ? statusCopy.rad
                : "Tre signaler. En tydlig bild."}
            </p>
          </div>

          <ArcGauge
            value={displayEnergy}
            color={statusFarg}
            active={harCheckatInIdag}
          />
        </div>

        {/* Signal chips — sömn / trötthet / belastning */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <SignalChip
            icon={<Moon size={13} strokeWidth={1.6} />}
            label="Sömn"
            value={somn != null ? `${somn}h` : "–"}
            color={harCheckatInIdag ? statusFarg : undefined}
          />
          <SignalChip
            icon={<Zap size={13} strokeWidth={1.6} />}
            label="Trötthet"
            value={
              harCheckatInIdag && senastePost
                ? trotthetLabel(senastePost.svar.trotthet)
                : "–"
            }
            color={harCheckatInIdag ? statusFarg : undefined}
          />
          <SignalChip
            icon={<Dumbbell size={13} strokeWidth={1.6} />}
            label="Belastning"
            value={
              harCheckatInIdag && senastePost
                ? belastningLabel(senastePost.svar.belastning)
                : "–"
            }
            color={harCheckatInIdag ? statusFarg : undefined}
          />
        </div>

        {/* CTA */}
        <Button
          align="center"
          glow={harCheckatInIdag}
          className="mt-5"
          onClick={harCheckatInIdag ? onPass : onCheckin}
        >
          {harCheckatInIdag
            ? passKnappText(senastePost?.svar)
            : "Gör check-in"}
          <ArrowRight size={19} strokeWidth={2} />
        </Button>
        {harCheckatInIdag && (
          <Button variant="quiet" className="mt-2" onClick={onCheckin}>
            Gör om check-in
          </Button>
        )}
      </div>

      {/* Diagram-kort */}
      <Card padding="md" className="animate-enter delay-2 mt-3">
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
      <div className="animate-enter delay-3 mt-6 grid gap-3 sm:grid-cols-3">
        <ActionCard
          icon={<CheckCircle2 size={18} strokeWidth={1.6} />}
          title="Hur mår kroppen"
          text="Tre frågor. En tydlig bild."
          onClick={onCheckin}
        />
        <ActionCard
          icon={<Dumbbell size={18} strokeWidth={1.6} />}
          title="Dagens pass"
          text="Anpassat efter hur du mår."
          onClick={onPass}
        />
        <ActionCard
          icon={<BarChart3 size={18} strokeWidth={1.6} />}
          title="Din utveckling"
          text="Sömn, energi och trend."
          onClick={onInsikter}
        />
      </div>

      {/* Premium */}
      {premium ? (
        <div className="animate-enter delay-4 mt-6 flex items-center gap-2 px-1">
          <Sparkles size={15} strokeWidth={1.6} className="text-accent" />
          <span className="text-bodysm text-text-secondary">Premium aktivt</span>
        </div>
      ) : (
        <Card padding="md" className="animate-enter delay-4 mt-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-hero font-semibold leading-none text-text-primary">
                {formatSEK(PLANS.month.amount)}
              </p>
              <p className="mt-1.5 text-caption text-text-secondary">
                per månad · avsluta när du vill
              </p>
            </div>
            <LockKeyhole size={18} strokeWidth={1.5} className="mb-0.5 shrink-0 text-text-tertiary" />
          </div>
          <Button glow className="mt-4" onClick={() => onPlan("month")}>
            Lås upp
          </Button>
          <button
            onClick={() => onPlan("year")}
            className="press mt-3 w-full text-center text-bodysm text-text-tertiary hover:text-text-secondary"
          >
            Eller {formatSEK(PLANS.year.amount)}/år · spara {PLANS.year.savingsPercent}%
          </button>
        </Card>
      )}
    </Screen>
  );
}

// ── Arc gauge ──────────────────────────────────────────────────────────────

function ArcGauge({
  value,
  color,
  active,
}: {
  value: number;
  color: string;
  active: boolean;
}) {
  const size = 82;
  const r = 29;
  const cx = size / 2;
  const cy = size / 2;
  const sw = 5;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * 0.75; // 270°
  const gap = circ * 0.25;
  const clamped = Math.max(0, Math.min(100, value));
  const fill = arcLen * (clamped / 100);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(135deg)" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--separator)"
          strokeWidth={sw}
          strokeDasharray={`${arcLen} ${gap}`}
          strokeLinecap="round"
        />
        {/* Fill */}
        {active && (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeDasharray={`${fill} ${circ - fill}`}
            strokeLinecap="round"
            style={{
              transition: "stroke-dasharray 0.9s cubic-bezier(0.34,1,0.64,1)",
              filter: clamped >= 70 ? `drop-shadow(0 0 5px ${color})` : "none",
            }}
          />
        )}
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {active ? (
          <>
            <span
              className="font-bold leading-none tabular-nums"
              style={{ fontSize: 21, color: "var(--text-primary)" }}
            >
              {clamped}
            </span>
            <span className="mt-0.5 text-micro uppercase tracking-wider text-text-tertiary">
              pts
            </span>
          </>
        ) : (
          <span className="text-body text-text-tertiary">–</span>
        )}
      </div>
    </div>
  );
}

// ── Signal chip ────────────────────────────────────────────────────────────

function SignalChip({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color?: string;
}) {
  const active = value !== "–";
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-[var(--radius-card-inner)] px-2 py-3"
      style={{ backgroundColor: "var(--bg-elevated)" }}
    >
      <span style={{ color: active && color ? color : "var(--text-tertiary)" }}>
        {icon}
      </span>
      <span
        className="text-bodysm font-semibold leading-none tabular-nums"
        style={{ color: active ? "var(--text-primary)" : "var(--text-tertiary)" }}
      >
        {value}
      </span>
      <span className="text-micro text-text-tertiary">{label}</span>
    </div>
  );
}

// ── Action card ────────────────────────────────────────────────────────────

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
    <button onClick={onClick} className="press lift hover-lift surface p-4 text-left">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-elevated text-accent">
        {icon}
      </span>
      <p className="mt-3 text-bodysm font-medium text-text-primary">{title}</p>
      <p className="mt-1 text-caption text-text-secondary">{text}</p>
    </button>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function passKnappText(svar?: CheckinSvar): string {
  if (!svar) return "Visa dagens pass";
  const plats = svar.plats;
  const tid = svar.tid;
  const platsTxt: string =
    plats === "hem" ? "hemmapass" :
    plats === "gym" ? "gympass" :
    plats === "utomhus" ? "utomhuspass" :
    "pass";
  const tidTxt: string | null =
    tid === "kort" ? "20 min" :
    tid === "mellan" ? "45 min" :
    tid === "lang" ? "60 min" :
    null;
  if (tidTxt) return `Visa ${tidTxt} ${platsTxt}`;
  if (platsTxt !== "pass") return `Visa ${platsTxt}`;
  return "Visa dagens pass";
}

function trotthetLabel(t: number): string {
  if (t <= 1) return "Pigg";
  if (t === 2) return "Okej";
  if (t === 3) return "Tungt";
  return "Slut";
}

function belastningLabel(b: string): string {
  if (b === "latt") return "Lätt";
  if (b === "medel") return "Medel";
  return "Tungt";
}

function formatDag(d: Date = new Date()): string {
  const weekday = d.toLocaleDateString("sv-SE", { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleDateString("sv-SE", { month: "short" });
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month}`;
}
