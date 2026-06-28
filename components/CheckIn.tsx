"use client";

import { useEffect, useMemo, useState } from "react";
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
  options: Alternativ[];
}

const FRAGOR: Fraga[] = [
  {
    label: "Hur sov du?",
    options: [
      { t: "Bra", sub: "Jag känner mig återhämtad", v: 8 },
      { t: "Okej", sub: "Det fungerar", v: 6 },
      { t: "Dåligt", sub: "Lite för lite sömn", v: 5 },
      { t: "Nästan inget", sub: "Jag behöver ta det lugnt", v: 3 },
    ],
  },
  {
    label: "Hur känns kroppen?",
    options: [
      { t: "Pigg", sub: "Jag har energi", v: 1 },
      { t: "Okej", sub: "Normal dag", v: 2 },
      { t: "Tung", sub: "Jag vill ta det försiktigt", v: 3 },
      { t: "Slut", sub: "Jag behöver vila", v: 4 },
    ],
  },
  {
    label: "Hur hårt var senaste passet?",
    options: [
      { t: "Hårt", sub: "Jag kände det efteråt", v: "tung" },
      { t: "Vanligt", sub: "Lagom belastning", v: "medel" },
      { t: "Lätt eller inget", sub: "Inte särskilt belastande", v: "latt" },
    ],
  },
];

export default function CheckIn({ onKlar, onAvbryt }: Props) {
  const [steg, setSteg] = useState(0);
  const [valtIndex, setValtIndex] = useState<number | null>(null);
  const [svar, setSvar] = useState<(number | Belastning)[]>([]);
  const progress = useMemo(() => ((steg + 1) / FRAGOR.length) * 100, [steg]);

  useEffect(() => {
    if (svar.length === 3) {
      const fullSvar: CheckinSvar = {
        somn: svar[0] as number,
        trotthet: svar[1] as number,
        belastning: svar[2] as Belastning,
      };
      const resultat = beraknaStatusResultat(fullSvar);
      const timeout = setTimeout(() => onKlar(resultat, fullSvar), 520);
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
    }, 220);
  }

  if (svar.length === FRAGOR.length) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center px-5">
        <div className="animate-enter text-center">
          <div
            className="animate-bounce-in mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-accent"
            style={{
              backgroundColor: "var(--accent-soft)",
              boxShadow: "0 0 28px var(--accent-glow)",
            }}
          >
            <Check size={24} strokeWidth={1.8} />
          </div>
          <p className="text-body text-text-primary">Räknar ut din dag</p>
          <p className="mt-2 text-bodysm text-text-secondary">
            Tar ett ögonblick…
          </p>
        </div>
      </div>
    );
  }

  const f = FRAGOR[steg];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
      <button
        onClick={onAvbryt}
        className="press mb-8 flex items-center gap-2 self-start text-bodysm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={18} strokeWidth={1.5} />
        Tillbaka
      </button>

      <div>
        <div className="mb-8 h-1.5 rounded-full bg-bg-elevated">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
          Fråga {steg + 1} av 3
        </p>
        <h1 className="mt-4 max-w-xl text-heading text-text-primary">
          {f.label}
        </h1>
      </div>

      <div key={steg} className="mt-10 grid gap-3 sm:grid-cols-2">
        {f.options.map((opt, i) => {
          const valt = valtIndex === i;
          return (
            <button
              key={opt.t}
              onClick={() => valj(i, opt.v)}
              className={`press surface min-h-[108px] w-full px-5 py-4 text-left ${valt ? "select-snap" : ""}`}
              style={{
                background: valt ? "var(--accent-soft)" : undefined,
                borderColor: valt ? "var(--accent)" : "var(--separator)",
                transition:
                  "background-color 0.2s var(--ease-spring), border-color 0.2s var(--ease-spring)",
              }}
            >
              <span className="block text-body font-medium text-text-primary">
                {opt.t}
              </span>
              <span className="mt-2 block text-bodysm text-text-secondary">
                {opt.sub}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
