"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Lock, MapPin, Volume2 } from "lucide-react";
import {
  equipmentMatches,
  getAdjustedExercises,
  getIntensityLabel,
  getWorkoutDuration,
  PASSBANK,
  type Pass,
} from "@/lib/passbank";
import { STATUS_COPY, STATUS_VAR, type Status } from "@/lib/status";
import type { EquipmentType, IntensityLevel } from "@/lib/types";
import {
  AudioControlView,
  EquipmentSelectionView,
  EQUIPMENT_LABELS,
  haptic,
} from "./FeatureViews";
import Screen from "./ui/Screen";
import Card from "./ui/Card";
import Button from "./ui/Button";
import { DividedList, DividedRow } from "./ui/DividedList";

interface Props {
  status: Status;
  premium: boolean;
  selectedIntensity: IntensityLevel;
  selectedEquipment: EquipmentType[];
  audioEnabled: boolean;
  onAudioEnabledChange: (value: boolean) => void;
  onEquipmentChange: (value: EquipmentType[]) => void;
  onComplete: (duration: number) => void;
  onTillbaka: () => void;
  onLast: () => void;
}

const STATUSAR: Status[] = ["redo", "gransfall", "vila"];

export default function PassVy({
  status,
  premium,
  selectedIntensity,
  selectedEquipment,
  audioEnabled,
  onAudioEnabledChange,
  onEquipmentChange,
  onComplete,
  onTillbaka,
  onLast,
}: Props) {
  const [aktivStatus, setAktivStatus] = useState<Status>(status);
  const allaPass = PASSBANK[aktivStatus];
  const filtreradePass = useMemo(
    () => allaPass.filter((p) => equipmentMatches(p, selectedEquipment)),
    [allaPass, selectedEquipment],
  );
  const pass = filtreradePass.length ? filtreradePass : allaPass;
  const [valtId, setValtId] = useState(allaPass[0].id);
  const farg = STATUS_VAR[aktivStatus];
  const copy = STATUS_COPY[aktivStatus];
  const duration = getWorkoutDuration(selectedIntensity);
  const intensityLabel = getIntensityLabel(selectedIntensity);

  const valt = useMemo<Pass>(
    () => pass.find((p) => p.id === valtId) ?? pass[0],
    [pass, valtId],
  );
  const ovningar = useMemo(
    () => getAdjustedExercises(valt, selectedIntensity),
    [selectedIntensity, valt],
  );
  const audioScript = [
    `Dagens läge är ${intensityLabel.toLowerCase()}.`,
    `Passet är ${valt.namn} och tar ungefär ${duration} minuter.`,
    "Börja lugnt. Det räcker att följa kroppen, inte prestera över den.",
  ].join(" ");

  function bytStatus(nyStatus: Status) {
    haptic();
    setAktivStatus(nyStatus);
    setValtId(PASSBANK[nyStatus][0].id);
  }

  function valjPass(p: Pass) {
    if (p.premium && !premium) {
      onLast();
      return;
    }
    haptic();
    setValtId(p.id);
  }

  function kravText(p: Pass) {
    if (p.equipmentRequired.includes("none")) return "Ingen utrustning";
    return p.equipmentRequired.map((item) => EQUIPMENT_LABELS[item]).join(", ");
  }

  return (
    <Screen width="wide" onBack={onTillbaka}>
      <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
            Passbank
          </p>
          <h1 className="mt-1 text-heading text-text-primary">
            Träning för rummet du redan är i.
          </h1>
          <p className="mt-2 text-bodysm text-text-secondary">
            {intensityLabel} · {duration} min · anpassat efter din utrustning
          </p>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {STATUSAR.map((s) => {
            const aktiv = s === aktivStatus;
            return (
              <button
                key={s}
                onClick={() => bytStatus(s)}
                className="press chip shrink-0 min-h-12 px-4 font-medium"
                style={{
                  color: aktiv ? STATUS_VAR[s] : "var(--text-secondary)",
                  background: aktiv ? "var(--accent-soft)" : undefined,
                }}
              >
                {STATUS_COPY[s].titel}
              </button>
            );
          })}
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Vänster — utrustning + passlista. Second on phone, first on lg. */}
        <div className="order-2 grid gap-3 lg:order-1">
          <EquipmentSelectionView
            selected={selectedEquipment}
            onChange={(value) => {
              onEquipmentChange(value);
              const next = PASSBANK[aktivStatus].filter((p) =>
                equipmentMatches(p, value),
              );
              setValtId((next[0] ?? PASSBANK[aktivStatus][0]).id);
            }}
          />

          <div className="grid gap-3">
            {pass.map((p) => {
              const aktiv = p.id === valt.id;
              const last = p.premium && !premium;
              return (
                <button
                  key={p.id}
                  onClick={() => valjPass(p)}
                  className="press surface p-4 text-left"
                  style={{
                    borderColor: aktiv ? farg : "var(--separator)",
                    background: aktiv ? "var(--bg-elevated)" : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
                        {p.niva}
                      </p>
                      <h2 className="mt-1 text-subheading text-text-primary">
                        {p.namn}
                      </h2>
                    </div>
                    {last && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated text-text-tertiary">
                        <Lock size={15} strokeWidth={1.5} />
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-bodysm text-text-secondary">
                    {p.beskrivning}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[`${duration} min`, p.fokus, kravText(p), p.ljud].map(
                      (tag) => (
                        <span key={tag} className="chip text-text-tertiary">
                          {tag}
                        </span>
                      ),
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Höger — vald pass som ren kort-stack. First on phone, second on lg. */}
        <div className="order-1 grid gap-3 lg:order-2">
          <Card padding="lg">
            <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
              {copy.titel} · {intensityLabel}
            </p>
            <h2 className="mt-2 text-heading text-text-primary">{valt.namn}</h2>
            <p className="mt-2 max-w-xl text-bodysm text-text-secondary sm:text-body">
              {valt.beskrivning}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="tile px-4 py-3">
                <Clock3 size={17} strokeWidth={1.5} style={{ color: farg }} />
                <p className="mt-2 text-caption text-text-tertiary">Tid</p>
                <p className="text-bodysm text-text-primary">{duration} min</p>
              </div>
              <div className="tile px-3 py-3 sm:px-4">
                <MapPin size={17} strokeWidth={1.5} style={{ color: farg }} />
                <p className="mt-2 text-caption text-text-tertiary">Krav</p>
                <p className="text-bodysm text-text-primary">{kravText(valt)}</p>
              </div>
              <div className="tile px-3 py-3 sm:px-4">
                <Volume2 size={17} strokeWidth={1.5} style={{ color: farg }} />
                <p className="mt-2 text-caption text-text-tertiary">Ljud</p>
                <p className="text-bodysm text-text-primary">{valt.ljud}</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <p className="mb-1 text-caption uppercase tracking-[0.08em] text-text-tertiary">
              Sekvens
            </p>
            <DividedList>
              {ovningar.map((o, i) => (
                <DividedRow key={`${o}-${i}`}>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-caption"
                    style={{ backgroundColor: "var(--accent-soft)", color: farg }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-body text-text-primary">{o}</span>
                </DividedRow>
              ))}
            </DividedList>
          </Card>

          <AudioControlView
            enabled={audioEnabled}
            onEnabledChange={onAudioEnabledChange}
            script={audioScript}
          />

          <Button
            align="center"
            glow
            onClick={() => onComplete(duration)}
          >
            <CheckCircle2 size={19} strokeWidth={1.7} />
            Klar med passet
          </Button>

          {valt.premium && !premium && (
            <Button variant="status" statusColor={farg} onClick={onLast}>
              <span>Lås upp passet</span>
              <Lock size={18} strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>
    </Screen>
  );
}
