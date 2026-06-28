"use client";

import { Wind } from "lucide-react";

interface Props {
  onSkapaKonto: () => void;
  onLoggaIn: () => void;
}

export default function WelcomeScreen({ onSkapaKonto, onLoggaIn }: Props) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-bg">
      {/* Subtil bakgrundsglöd */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 80%, rgba(198,241,53,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-between px-6 pb-10 pt-16 sm:pt-24">
        {/* Logotyp + namn */}
        <div className="flex flex-col items-center gap-5 animate-enter">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-[22px]"
            style={{
              background:
                "linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-raised) 100%)",
              border: "1px solid var(--separator)",
              boxShadow: "0 0 32px rgba(198,241,53,0.12), 0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <Wind size={28} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
          </div>
          <p className="text-caption uppercase tracking-[0.12em] text-text-tertiary">
            Återställ
          </p>
        </div>

        {/* Hero-copy */}
        <div className="mx-auto max-w-xs text-center" style={{ animationDelay: "80ms" }}>
          <div className="animate-enter" style={{ animationDelay: "60ms" }}>
            <h1
              className="text-hero text-text-primary"
              style={{ lineHeight: "1.08", letterSpacing: "-0.02em" }}
            >
              Lyssna på
              <br />
              kroppen.
              <br />
              <span style={{ color: "var(--accent)" }}>Varje dag.</span>
            </h1>
            <p className="mt-5 text-body text-text-secondary">
              Spåra din återhämtning, anpassa varje pass och se mönstren som
              förklarar hur du mår — på riktigt.
            </p>
          </div>

          {/* Feature-punkter */}
          <div
            className="mt-8 grid gap-3 text-left animate-enter"
            style={{ animationDelay: "120ms" }}
          >
            {PUNKTER.map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-caption"
                  style={{
                    backgroundColor: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {icon}
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
        </div>
      </div>
    </main>
  );
}

const PUNKTER = [
  { icon: "↑", text: "Daglig check-in på sömn, trötthet och belastning." },
  { icon: "◈", text: "Anpassade pass baserade på hur kroppen mår idag." },
  { icon: "~", text: "Mönster och insikter som byggs upp över tid." },
];
