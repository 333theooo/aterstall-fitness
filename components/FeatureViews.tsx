"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Pause, Play, SlidersHorizontal, Wind } from "lucide-react";
import type { EquipmentType, IntensityLevel } from "@/lib/types";
import { AudioGuideManager } from "@/lib/audioGuide";
import Screen from "./ui/Screen";
import Card from "./ui/Card";
import Button from "./ui/Button";

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  none: "Ingen utrustning",
  mat: "Träningsmatta",
  dumbbells: "Hantlar",
  band: "Gummiband",
  step: "Stepbräda",
};

export function haptic() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(18);
  }
}

export function IntensitySelectionView({
  value,
  onChange,
  onContinue,
}: {
  value: IntensityLevel;
  onChange: (value: IntensityLevel) => void;
  onContinue: () => void;
}) {
  const choices: Array<{
    id: IntensityLevel;
    emoji: string;
    label: string;
    text: string;
  }> = [
    { id: "calm", emoji: "😌", label: "Lugn", text: "15 min, mjukare tempo" },
    { id: "balanced", emoji: "🙂", label: "Balans", text: "25 min, lagom pass" },
    { id: "focused", emoji: "⚡️", label: "Fokus", text: "35 min, mer energi" },
  ];

  return (
    <Screen>
      <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
        Dagsform
      </p>
      <h1 className="mt-3 text-heading text-text-primary">
        Välj intensitet
      </h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {choices.map((choice) => {
          const active = choice.id === value;
          return (
            <button
              key={choice.id}
              onClick={() => {
                haptic();
                onChange(choice.id);
              }}
              className="press surface p-5 text-center"
              style={{
                borderColor: active ? "var(--accent)" : "var(--separator)",
                background: active ? "var(--accent-soft)" : undefined,
                boxShadow: active ? "0 0 16px var(--accent-glow)" : "none",
                transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <span className="block text-4xl">{choice.emoji}</span>
              <span className="mt-3 block text-body font-semibold text-text-primary">
                {choice.label}
              </span>
              <span className="mt-1 block text-caption text-text-secondary">
                {choice.text}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        className="mt-6"
        onClick={() => {
          haptic();
          onContinue();
        }}
      >
        Fortsätt till pass
        <ChevronRight size={19} strokeWidth={1.6} />
      </Button>
    </Screen>
  );
}

export function EquipmentSelectionView({
  selected,
  onChange,
}: {
  selected: EquipmentType[];
  onChange: (value: EquipmentType[]) => void;
}) {
  const items: EquipmentType[] = ["none", "mat", "dumbbells", "band", "step"];

  function toggle(item: EquipmentType) {
    haptic();
    if (item === "none") {
      onChange(["none"]);
      return;
    }
    const next = selected.includes(item)
      ? selected.filter((value) => value !== item)
      : [...selected.filter((value) => value !== "none"), item];
    onChange(next.length ? next : ["none"]);
  }

  return (
    <Card padding="md">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal size={18} strokeWidth={1.5} className="text-accent" />
        <div>
          <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
            Utrustning
          </p>
          <h2 className="text-subheading text-text-primary">
            Vad har du nära dig?
          </h2>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const active = selected.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className="press tile flex min-h-12 items-center justify-between px-4 py-3 text-left text-bodysm"
              style={{
                color: active ? "var(--accent)" : "var(--text-primary)",
                background: active ? "var(--accent-soft)" : undefined,
              }}
            >
              {EQUIPMENT_LABELS[item]}
              {active && <Check size={16} strokeWidth={1.8} />}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export function AudioControlView({
  enabled,
  onEnabledChange,
  script,
}: {
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  script: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const audioManager = useRef(new AudioGuideManager());

  function stopGuidance() {
    audioManager.current.stopGuidance();
    setPlaying(false);
  }

  function startGuidance() {
    haptic();
    if (!enabled) onEnabledChange(true);
    audioManager.current.startGuidance(script, volume);
    setPlaying(true);
  }

  function pauseGuidance() {
    haptic();
    if (playing) {
      audioManager.current.pauseGuidance();
      setPlaying(false);
    } else {
      audioManager.current.pauseGuidance();
      setPlaying(true);
    }
  }

  useEffect(() => {
    const manager = audioManager.current;
    return () => manager.stopGuidance();
  }, []);

  return (
    <Card padding="md">
      <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
        Ljudguidning
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={playing ? pauseGuidance : startGuidance}
          className="press flex h-11 w-11 items-center justify-center rounded-full border border-separator text-accent"
          aria-label={playing ? "Pausa ljud" : "Spela ljud"}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          onClick={() => {
            haptic();
            onEnabledChange(!enabled);
            stopGuidance();
          }}
          className="press tile px-4 py-3 text-bodysm text-text-primary"
        >
          {enabled ? "Ljud på" : "Ljud av"}
        </button>
        <input
          aria-label="Volym"
          className="min-w-0 flex-1"
          style={{ accentColor: "var(--accent)" }}
          max="1"
          min="0"
          step="0.05"
          type="range"
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
        />
      </div>
    </Card>
  );
}

export function RecoveryView({ onDone }: { onDone: () => void }) {
  const [tab, setTab] = useState<"stretch" | "breath" | "meditation">("stretch");
  const [minutes, setMinutes] = useState(5);
  const tabs = [
    ["stretch", "Stretching"],
    ["breath", "Andning"],
    ["meditation", "Meditation"],
  ] as const;

  return (
    <Screen>
      <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
        Återställ
      </p>
      <h1 className="mt-3 text-heading text-text-primary">Återhämtning</h1>
      <p className="mt-2 text-bodysm text-text-secondary">
        Ta det lugnt idag.
      </p>
      <div className="mt-5 grid grid-cols-3 gap-2">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => {
              haptic();
              setTab(id);
            }}
            className="press tile min-h-12 px-3 py-3 text-caption font-medium"
            style={{
              color: tab === id ? "var(--vila)" : "var(--text-secondary)",
              background: tab === id ? "var(--accent-soft)" : undefined,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[5, 10, 15].map((value) => (
          <button
            key={value}
            onClick={() => setMinutes(value)}
            className="press tile min-h-12 px-3 py-3 text-bodysm"
            style={{
              color: minutes === value ? "var(--vila)" : "var(--text-primary)",
              background: minutes === value ? "var(--accent-soft)" : undefined,
            }}
          >
            {value} min
          </button>
        ))}
      </div>
      <Card padding="md" className="mt-3 text-center">
        {tab === "breath" ? (
          <BreathingAnimationView />
        ) : (
          <div className="py-10">
            <Wind className="mx-auto mb-4" color="var(--vila)" size={32} />
            <p className="text-subheading text-text-primary">
              {tab === "stretch" ? "Mjuk stretch" : "Stilla meditation"}
            </p>
            <p className="mt-2 text-bodysm text-text-secondary">
              {minutes} minuter. Ingen prestation.
            </p>
          </div>
        )}
      </Card>
      <Button
        align="center"
        glow
        className="mt-6"
        onClick={() => {
          haptic();
          onDone();
        }}
      >
        Klar
      </Button>
    </Screen>
  );
}

export function BreathingAnimationView() {
  return (
    <div className="py-10 text-center">
      <div
        className="breathing-circle mx-auto flex h-40 w-40 items-center justify-center rounded-full border"
        style={{ borderColor: "var(--vila)" }}
      >
        <span className="text-bodysm font-medium" style={{ color: "var(--vila)" }}>
          4-7-8
        </span>
      </div>
      <p className="mt-5 text-subheading text-text-primary">
        Andas in. Håll. Andas ut.
      </p>
      <p className="mt-2 text-bodysm text-text-secondary">
        Cirkeln följer en lugn 4-7-8-rytm.
      </p>
    </div>
  );
}
