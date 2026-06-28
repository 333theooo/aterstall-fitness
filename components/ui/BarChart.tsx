// Stapeldiagram (§5 diagram). En highlightad stapel (--accent + glow + värde-
// bubbla), data-staplar i --accent-dim, tomma dagar som svag --bg-elevated.
// Delas mellan hem ("Senaste dagarna") och Historik ("Veckans aktivitet").

import type { Bar } from "@/lib/historik";

interface BarChartProps {
  bars: Bar[];
  height?: number; // pixelhöjd för stapelytan
}

const MIN_BAR = 12; // px — synlig även vid lågt värde
const EMPTY_BAR = 10; // px — dag utan data

export default function BarChart({ bars, height = 92 }: BarChartProps) {
  return (
    <div className="flex items-end gap-2">
      {bars.map((bar, index) => {
        const hasData = bar.value != null;
        const active = Boolean(bar.highlight) && hasData;
        const barHeight = hasData
          ? Math.max(MIN_BAR, (bar.value! / 100) * height)
          : EMPTY_BAR;
        return (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="relative flex w-full items-end justify-center"
              style={{ height }}
            >
              {active && bar.bubble && (
                <span
                  className="absolute -top-1 rounded-md px-1.5 py-0.5 text-micro font-semibold"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--bg)",
                  }}
                >
                  {bar.bubble}
                </span>
              )}
              <div
                className="bar-rise w-full max-w-[18px] rounded-full"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: active
                    ? "var(--accent)"
                    : hasData
                      ? "var(--accent-dim)"
                      : "var(--bg-elevated)",
                  boxShadow: active ? "0 0 12px var(--accent-glow)" : "none",
                  animationDelay: `${index * 45}ms`,
                }}
              />
            </div>
            <span
              className="text-caption"
              style={{
                color: active ? "var(--accent)" : "var(--text-tertiary)",
              }}
            >
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
