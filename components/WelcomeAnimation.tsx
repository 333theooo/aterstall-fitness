"use client";

import { Wind } from "lucide-react";

interface Props {
  name: string;
  onDone: () => void;
}

export default function WelcomeAnimation({ name, onDone }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
      onClick={onDone}
    >
      {/* Ambient lime glow rising from bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 50% 100%, rgba(198,241,53,0.13) 0%, transparent 70%)",
        }}
      />
      {/* Secondary glow — soft top left */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-1/3 w-1/2"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 0% 0%, rgba(198,241,53,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Main content */}
      <div className="animate-welcome-in relative z-10 flex flex-col items-center text-center px-8">
        <div className="mb-8 flex items-center justify-center">
          <Wind
            size={26}
            strokeWidth={1.3}
            className="animate-float"
            style={{ color: "var(--accent)" }}
          />
        </div>

        <p
          className="text-body font-light"
          style={{
            color: "var(--text-tertiary)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          Välkommen,
        </p>

        <p
          className="mt-3 font-semibold"
          style={{
            color: "var(--text-primary)",
            fontSize: "clamp(40px, 10vw, 56px)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          {name}
        </p>

        {/* Lime accent line */}
        <div
          className="mt-8 h-px w-10 rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
      </div>

      {/* Progress bar at bottom */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5"
        style={{ backgroundColor: "var(--separator)" }}
      >
        <div
          className="animate-progress-fill h-full rounded-full"
          style={{ backgroundColor: "var(--accent)" }}
        />
      </div>
    </div>
  );
}
