"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { FOUNDING, PLANS, formatSEK } from "@/lib/pricing";
import { logAnonEvent } from "@/lib/analytics";

// Visas på /protokollet/tack för bekräftade köpare.
// Erbjuder årsplan (grundarpris om aktivt) utan FOMO — prislåsning, inte countdown.
// Navigerar till /?offer=founding där appen öppnar uppgraderingsmodalen direkt.
export default function BrygganErbjudande() {
  const loggedRef = useRef(false);

  useEffect(() => {
    if (loggedRef.current) return;
    loggedRef.current = true;
    void logAnonEvent("bridge_offer_shown", {
      founding_enabled: FOUNDING.enabled,
    });
  }, []);

  const pris = FOUNDING.enabled ? FOUNDING.amount : PLANS.year.amount;
  const prisText = formatSEK(pris);
  const dest = FOUNDING.enabled ? "/?offer=founding" : "/?offer=year";

  async function handleClick() {
    await logAnonEvent("bridge_offer_taken", {
      founding_enabled: FOUNDING.enabled,
    });
  }

  return (
    <div className="mt-10 surface p-5">
      <p className="text-caption uppercase tracking-[0.06em] text-text-tertiary">
        Fortsätt med appen
      </p>
      <h2 className="mt-3 text-subheading font-semibold text-text-primary">
        Vill du följa din återhämtning dag för dag?
      </h2>
      <p className="mt-2 text-bodysm text-text-secondary">
        Appen loggar sömn, trötthet och status — och anpassar varje pass efter
        hur kroppen mår just nu.{" "}
        {FOUNDING.enabled ? (
          <>
            Som tidig köpare erbjuds du{" "}
            <strong className="text-accent">{prisText}/år</strong> — ett pris
            som är låst så länge du stannar.
          </>
        ) : (
          <>
            Årsplanen kostar{" "}
            <strong className="text-accent">{prisText}/år</strong>.
          </>
        )}
      </p>
      <Link
        href={dest}
        onClick={handleClick}
        className="press mt-5 flex min-h-11 w-full items-center justify-center rounded-[var(--radius-btn)] bg-accent px-6 text-bodysm font-semibold"
        style={{ color: "var(--bg)" }}
      >
        Öppna appen
      </Link>
      <p className="mt-3 text-center text-caption text-text-tertiary">
        Avsluta när du vill. Protokollet är alltid ditt.
      </p>
    </div>
  );
}
