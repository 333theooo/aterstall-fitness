"use client";

import { Moon, TrendingUp, Wind, Zap } from "lucide-react";
import { PLANS, formatSEK } from "@/lib/pricing";

interface Props {
  onSkapaKonto: () => void;
  onLoggaIn: () => void;
}

export default function WelcomeScreen({ onSkapaKonto, onLoggaIn }: Props) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-bg">
      {/* Bakgrundsglöd — dubbel radial för djup */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 85%, rgba(198,241,53,0.10) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 15% 20%, rgba(198,241,53,0.05) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-between px-6 pb-10 pt-16 sm:pt-24">
        {/* Logotyp + namn */}
        <div className="flex flex-col items-center gap-5 animate-enter">
          <div
            className="animate-float flex h-16 w-16 items-center justify-center rounded-[22px]"
            style={{
              background:
                "linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-raised) 100%)",
              border: "1px solid var(--separator)",
              boxShadow: "0 0 40px rgba(198,241,53,0.18), 0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <Wind size={28} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
          </div>
          <p className="text-caption uppercase tracking-[0.12em] text-text-tertiary">
            Återställ
          </p>
        </div>

        {/* Hero-copy */}
        <div className="mx-auto max-w-xs text-center">
          <div className="animate-enter" style={{ animationDelay: "60ms" }}>
            <h1
              className="text-hero text-text-primary"
              style={{ lineHeight: "1.08", letterSpacing: "-0.02em" }}
            >
              Din kropp vet.
              <br />
              <span style={{ color: "var(--accent)" }}>Du behöver bara fråga.</span>
            </h1>
            <p className="mt-5 text-body text-text-secondary">
              Tre frågor om dagen. Appen resten.
            </p>
          </div>

          {/* Feature-punkter — staggerad entré */}
          <div className="mt-8 grid gap-3 text-left">
            {PUNKTER.map(({ Icon, text }, i) => (
              <div
                key={text}
                className={`animate-enter flex items-start gap-3 delay-${i + 2}`}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  <Icon size={14} strokeWidth={2} />
                </span>
                <p className="text-bodysm text-text-secondary">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA-knappar */}
        <div
          className="w-full max-w-xs animate-enter"
          style={{ animationDelay: "180ms" }}
        >
          <button
            onClick={onSkapaKonto}
            className="press flex w-full items-center justify-center rounded-[var(--radius-btn)] py-4 text-bodysm font-semibold animate-glow-pulse"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--bg)",
              minHeight: "52px",
            }}
          >
            Kom igång gratis
          </button>
          <button
            onClick={onLoggaIn}
            className="press mt-3 flex w-full items-center justify-center rounded-[var(--radius-btn)] py-4 text-bodysm font-medium"
            style={{
              backgroundColor: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              minHeight: "52px",
              border: "1px solid var(--separator)",
            }}
          >
            Logga in
          </button>

          {/* Price anchor — primes the paywall, removes sticker shock */}
          <p className="mt-5 text-center text-caption text-text-tertiary">
            Premium från{" "}
            <span className="text-text-secondary font-medium">
              {formatSEK(PLANS.month.amount)}/mån
            </span>
            {" "}· Kom igång helt gratis
          </p>
        </div>
      </div>
    </main>
  );
}

const PUNKTER = [
  { Icon: TrendingUp, text: "Förstå varför du presterar som du gör — varje dag." },
  { Icon: Zap, text: "Pass som möter kroppen. Inte ett schema." },
  { Icon: Moon, text: "Se mönstren ingen PT berättar om." },
];
