"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import {
  beraknaStatusResultat,
  type Belastning,
  type CheckinSvar,
  type StatusResultat,
} from "@/lib/status";

interface Props {
  onKlar: (resultat: StatusResultat, svar: CheckinSvar) => void;
  onAvbryt: () => void;
}

interface Alternativ {
  t: string;
  sub: string;
  v: number | Belastning;
}

interface Fraga {
  label: string;
  context: string;
  options: Alternativ[];
}

const LETTERS = ["A", "B", "C", "D"];

const FRAGOR: Fraga[] = [
  {
    label: "Hur sov du i natt?",
    context: "Sömnen sätter tonen för hela dagen.",
    options: [
      { t: "Bra sömn", sub: "Kände mig återhämtad", v: 8 },
      { t: "Gick an", sub: "Fungerade, men inte perfekt", v: 6 },
      { t: "Dåligt", sub: "Lite för lite sömn", v: 5 },
      { t: "Nästan inget", sub: "Behöver ta det lugnt idag", v: 3 },
    ],
  },
  {
    label: "Hur känns kroppen just nu?",
    context: "Din känsla just nu är data — inte klagan.",
    options: [
      { t: "Pigg", sub: "Har energi och vilja", v: 1 },
      { t: "Okej", sub: "Normal dag, inget speciellt", v: 2 },
      { t: "Tung", sub: "Vill ta det försiktigt", v: 3 },
      { t: "Slut", sub: "Kroppen ber om vila", v: 4 },
    ],
  },
  {
    label: "Hur tungt var senaste passet?",
    context: "Din historik avgör vad kroppen klarar idag.",
    options: [
      { t: "Hårt", sub: "Kände det efteråt", v: "tung" },
      { t: "Lagom", sub: "Normal belastning", v: "medel" },
      { t: "Lätt eller inget", sub: "Inte särskilt belastande", v: "latt" },
    ],
  },
];

export default function CheckIn({ onKlar, onAvbryt }: Props) {
  const [steg, setSteg] = useState(0);
  const [valtIndex, setValtIndex] = useState<number | null>(null);
  const [svar, setSvar] = useState<(number | Belastning)[]>([]);

  useEffect(() => {
    if (svar.length === 3) {
      const fullSvar: CheckinSvar = {
        somn: svar[0] as number,
        trotthet: svar[1] as number,
        belastning: svar[2] as Belastning,
      };
      const resultat = beraknaStatusResultat(fullSvar);
      const timeout = setTimeout(() => onKlar(resultat, fullSvar), 600);
      return () => clearTimeout(timeout);
    }
  }, [svar, onKlar]);

  function valj(index: number, v: number | Belastning) {
    if (valtIndex !== null) return;
    setValtIndex(index);
    setTimeout(() => {
      setSvar((nu) => [...nu, v]);
      setValtIndex(null);
      setSteg((nu) => nu + 1);
    }, 240);
  }

  // ── Completion screen ────────────────────────────────────────────────────
  if (svar.length === FRAGOR.length) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-5">
        <div className="animate-enter text-center">
          <div
            className="animate-bounce-in mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: "var(--accent-soft)",
              boxShadow: "0 0 32px var(--accent-glow)",
              color: "var(--accent)",
            }}
          >
            <Check size={26} strokeWidth={1.8} />
          </div>
          <p className="text-body font-medium text-text-primary">
            Analyserar svaren
          </p>
          <p className="mt-2 text-bodysm text-text-secondary">
            Din coach räknar ut din dag…
          </p>
          {/* Pulsing dots */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{
                  backgroundColor: "var(--accent)",
                  animationDelay: `${i * 180}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const f = FRAGOR[steg];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-28 pt-8">
      {/* Back button — icon only */}
      <button
        onClick={onAvbryt}
        className="press mb-10 flex h-10 w-10 items-center justify-center self-start rounded-full text-text-tertiary hover:text-text-secondary"
        style={{ backgroundColor: "var(--bg-elevated)" }}
        aria-label="Tillbaka"
      >
        <ArrowLeft size={17} strokeWidth={1.5} />
      </button>

      {/* Progress header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-caption uppercase tracking-[0.12em] text-text-tertiary">
            Coach check-in
          </span>
          <span className="text-caption text-text-tertiary">
            {steg + 1} / {FRAGOR.length}
          </span>
        </div>
        {/* Segmented progress dots */}
        <div className="flex gap-1.5">
          {FRAGOR.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor:
                  i < steg
                    ? "var(--accent)"
                    : i === steg
                      ? "var(--accent)"
                      : "var(--separator)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Question — re-mounts on each step to trigger slide-in */}
      <div key={steg} className="animate-enter">
        <p className="text-bodysm text-text-tertiary">{f.context}</p>
        <h1 className="mt-3 text-heading text-text-primary">{f.label}</h1>
      </div>

      {/* Options — staggered fade-in on each step */}
      <div key={`opts-${steg}`} className="mt-8 grid gap-2.5">
        {f.options.map((opt, i) => {
          const valt = valtIndex === i;
          return (
            <button
              key={opt.t}
              onClick={() => valj(i, opt.v)}
              className={`press animate-enter flex w-full items-center gap-4 rounded-[var(--radius-card)] border px-5 py-4 text-left${valt ? " select-snap" : ""}`}
              style={{
                borderColor: valt ? "var(--accent)" : "var(--separator)",
                backgroundColor: valt
                  ? "var(--accent-soft)"
                  : "var(--bg-raised)",
                boxShadow: valt ? "0 0 20px var(--accent-glow)" : "none",
                transition:
                  "background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
                animationDelay: `${i * 55}ms`,
              }}
            >
              {/* Letter badge → checkmark on select */}
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold transition-all duration-150"
                style={{
                  backgroundColor: valt
                    ? "var(--accent)"
                    : "var(--bg-elevated)",
                  color: valt ? "var(--bg)" : "var(--text-tertiary)",
                  fontSize: "12px",
                }}
              >
                {valt ? (
                  <Check size={13} strokeWidth={2.5} />
                ) : (
                  LETTERS[i]
                )}
              </span>

              {/* Text */}
              <div className="min-w-0">
                <span className="block text-body font-semibold text-text-primary">
                  {opt.t}
                </span>
                <span className="mt-0.5 block text-bodysm text-text-secondary">
                  {opt.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
