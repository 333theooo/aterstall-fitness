"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { AppState } from "@/lib/types";

interface Props {
  state: Pick<AppState, "premium" | "lastPaymentStatus" | "hasHadSubscription">;
}

const LS_DISMISSED = "aterstall.banner.dismissed";

function isDismissed(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(LS_DISMISSED);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    return list.includes(key);
  } catch {
    return false;
  }
}

function dismiss(key: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(LS_DISMISSED);
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!list.includes(key)) list.push(key);
    window.localStorage.setItem(LS_DISMISSED, JSON.stringify(list));
  } catch {
    // ignorera
  }
}

// Visar max én banner åt gången (dunning > win-back > ingenting).
// Aldrig push-spam — visas bara om Supabase bekräftar tillståndet.
export default function RevenueBanners({ state }: Props) {
  const { premium, lastPaymentStatus, hasHadSubscription } = state;

  const [dunningDismissed, setDunningDismissed] = useState(() =>
    isDismissed("dunning"),
  );
  const [winbackDismissed, setWinbackDismissed] = useState(() =>
    isDismissed("winback"),
  );

  const showDunning =
    !premium &&
    lastPaymentStatus === "failed" &&
    !dunningDismissed;

  const showWinback =
    !premium &&
    hasHadSubscription &&
    !showDunning &&
    !winbackDismissed;

  if (!showDunning && !showWinback) return null;

  if (showDunning) {
    return (
      <Banner
        onDismiss={() => {
          dismiss("dunning");
          setDunningDismissed(true);
        }}
      >
        <p className="text-bodysm font-semibold text-text-primary">
          Betalning misslyckades
        </p>
        <p className="mt-1 text-caption text-text-secondary">
          Vi försöker igen automatiskt. Uppdatera betalningsmetoden om problemet
          kvarstår.
        </p>
        <a
          href="/api/portal"
          className="press mt-3 inline-flex min-h-11 items-center text-bodysm font-medium"
          style={{ color: "var(--accent)" }}
        >
          Uppdatera kort
        </a>
      </Banner>
    );
  }

  return (
    <Banner
      onDismiss={() => {
        dismiss("winback");
        setWinbackDismissed(true);
      }}
    >
      <p className="text-bodysm font-semibold text-text-primary">
        Välkommen tillbaka
      </p>
      <p className="mt-1 text-caption text-text-secondary">
        Du kan återaktivera ditt premium-konto när som helst.
      </p>
      <Link
        href="/?offer=year"
        className="press mt-3 inline-flex min-h-11 items-center text-bodysm font-medium"
        style={{ color: "var(--accent)" }}
      >
        Återaktivera
      </Link>
    </Banner>
  );
}

function Banner({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div className="surface relative p-4 pr-11">
      <button
        onClick={onDismiss}
        className="press absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated text-text-tertiary hover:text-text-primary"
        aria-label="Stäng"
      >
        <X size={16} strokeWidth={1.5} />
      </button>
      {children}
    </div>
  );
}
