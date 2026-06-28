"use client";

import { ArrowRight, BarChart3, Dumbbell, LockKeyhole, RotateCcw } from "lucide-react";
import {
  STATUS_COPY,
  STATUS_VAR,
  type CheckinSvar,
  type Plats,
  type StatusResultat,
  type Tid,
} from "@/lib/status";
import Screen from "./ui/Screen";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { DividedList, DividedRow } from "./ui/DividedList";

interface Props {
  resultat: StatusResultat;
  streak: number;
  svar?: CheckinSvar | null;
  premium?: boolean;
  onVisaPass: () => void;
  onInsikter: () => void;
  onNyCheckin: () => void;
  onUpgrade?: () => void;
}

function poangText(poang: number) {
  return poang > 0 ? `+${poang}` : String(poang);
}

function passKontext(plats?: Plats, tid?: Tid): string {
  const platsTxt =
    plats === "hem" ? "hemma" :
    plats === "gym" ? "på gym" :
    plats === "utomhus" ? "utomhus" :
    null;
  const tidTxt =
    tid === "kort" ? "15–20 min" :
    tid === "mellan" ? "30–45 min" :
    tid === "lang" ? "60 min+" :
    null;
  if (platsTxt && tidTxt) return `${tidTxt} · ${platsTxt}`;
  if (tidTxt) return `Ca ${tidTxt}`;
  if (platsTxt) return `Anpassat för ${platsTxt}`;
  return "Baserat på hur du mår just nu.";
}

function poangFarg(poang: number) {
  if (poang > 0) return "var(--redo)";
  if (poang < 0) return "var(--vila)";
  return "var(--text-secondary)";
}

export default function StatusVy({
  resultat,
  streak,
  svar,
  premium = false,
  onVisaPass,
  onInsikter,
  onNyCheckin,
  onUpgrade,
}: Props) {
  const copy = STATUS_COPY[resultat.status];
  const farg = STATUS_VAR[resultat.status];
  const visadStreak = Math.max(streak, 1);
  const passKontextRad = passKontext(svar?.plats, svar?.tid);
  const visaUppgraderingNudge = !premium && resultat.status === "vila" && onUpgrade;

  return (
    <Screen width="wide">
      <div className="grid gap-3 lg:grid-cols-2">
        {/* Hero — dagens status + handlingar */}
        <Card
          padding="lg"
          className="flex flex-col justify-between"
        >
          <div>
            <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
              Dagens svar
            </p>
            <h1 className="mt-3 text-hero" style={{ color: farg }}>
              {copy.titel}
            </h1>
            <p className="mt-4 max-w-lg text-body text-text-primary">
              {copy.rad}
            </p>
            <p className="mt-2 max-w-lg text-bodysm text-text-secondary sm:text-body">
              {copy.riktning}
            </p>
          </div>

          <div className="mt-8 grid gap-2">
            <Button variant="status" statusColor={farg} onClick={onVisaPass}>
              <span>
                {resultat.status === "vila" ? "Öppna återhämtning" : "Visa pass"}
              </span>
              <Dumbbell size={20} strokeWidth={1.5} />
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" align="center" onClick={onInsikter}>
                <BarChart3 size={17} strokeWidth={1.5} />
                Historik
              </Button>
              <Button variant="secondary" align="center" onClick={onNyCheckin}>
                <RotateCcw size={17} strokeWidth={1.5} />
                Gör om
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-3">
          {/* Varför — poänguppdelning som ren lista */}
          <Card padding="md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
                  Varför {copy.titel.toLowerCase()}?
                </p>
                <h2 className="mt-2 text-subheading text-text-primary">
                  Så räknade vi:
                </h2>
              </div>
              <span
                className="rounded-[var(--radius-btn)] px-3 py-1.5 text-body font-semibold"
                style={{ color: farg, background: "var(--accent-soft)" }}
              >
                {poangText(resultat.poang)}
              </span>
            </div>

            <DividedList className="mt-4">
              {resultat.delar.map((del) => (
                <DividedRow key={del.id} className="items-start">
                  <span
                    className="chip shrink-0 font-medium"
                    style={{ color: poangFarg(del.poang) }}
                  >
                    {poangText(del.poang)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-bodysm font-medium text-text-primary">
                      {del.label}
                    </span>
                    <span className="mt-0.5 block text-caption text-text-secondary">
                      {del.text}
                    </span>
                  </span>
                </DividedRow>
              ))}
            </DividedList>
          </Card>

          {/* Streak */}
          <Card padding="md" className={streak >= 7 ? "animate-celebrate" : undefined}>
            <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
              Dagar
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p
                  className="text-heading"
                  style={{ color: visadStreak >= 3 ? "var(--accent)" : "var(--text-primary)" }}
                >
                  {visadStreak}
                </p>
                <p className="text-bodysm text-text-secondary">
                  {visadStreak === 1 ? "dag" : "dagar"} i rad
                </p>
              </div>
              <p className="max-w-[200px] text-right text-caption text-text-tertiary sm:text-bodysm">
                Vila räknas också. Det viktiga är att checka in.
              </p>
            </div>
          </Card>

          {/* Passnivå — navigeringsrad */}
          <button
            onClick={onVisaPass}
            className="press lift surface flex items-center justify-between p-5 text-left"
          >
            <span>
              <span className="block text-bodysm font-medium text-text-primary">
                {copy.passNiva}
              </span>
              <span className="mt-1 block text-caption text-text-secondary">
                {passKontextRad}
              </span>
            </span>
            <ArrowRight size={20} strokeWidth={1.5} color={farg} />
          </button>
        </div>
      </div>

      {/* ── Vila recovery upsell — visas bara för gratisanvändare med vila-status ── */}
      {visaUppgraderingNudge && (
        <div
          className="animate-enter mt-4 overflow-hidden rounded-[var(--radius-card)] border p-5"
          style={{
            borderColor: "var(--separator)",
            background: "linear-gradient(145deg, var(--bg-raised), var(--bg))",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <LockKeyhole size={14} strokeWidth={1.6} style={{ color: "var(--vila)" }} />
            <p className="text-caption uppercase tracking-[0.1em]" style={{ color: "var(--vila)" }}>
              Djupare återhämtning
            </p>
          </div>
          <p className="text-bodysm font-medium text-text-primary">
            Kroppen signalerar vila. Se vad som driver det.
          </p>
          <p className="mt-1.5 text-bodysm text-text-secondary">
            Med premium ser du kopplingen mellan sömn, trötthet och vila — och vad som faktiskt hjälper kroppen tillbaka.
          </p>
          <button
            onClick={onUpgrade}
            className="press mt-4 flex w-full items-center justify-center rounded-[var(--radius-btn)] py-3 text-bodysm font-semibold"
            style={{ backgroundColor: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--separator)" }}
          >
            Lås upp din återhämtning
          </button>
        </div>
      )}
    </Screen>
  );
}
