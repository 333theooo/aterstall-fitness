// Delad historik-/diagramlogik för hem och Historik. Håller stapel- och
// energiberäkningen på ett ställe så vyerna inte räknar olika.

import { beraknaStatusResultat } from "./status";
import { lokalDatum } from "./streak";
import type { CheckinPost, WorkoutSession } from "./types";

export interface Bar {
  label: string;
  value: number | null; // 0–100, null = ingen data
  highlight?: boolean;
  bubble?: string;
}

// Poängen ligger i -5..+5. Översätt till en energinivå 0–100. Ärlig mappning,
// ingen falsk precision — bara en visuell representation av dagens status.
export function energiPct(poang: number): number {
  return Math.min(100, Math.max(0, Math.round(((poang + 5) / 10) * 100)));
}

const VECKODAG = ["S", "M", "T", "O", "T", "F", "L"];

// Senaste N dagarnas check-ins som staplar (idag highlightad om incheckad).
export function senasteDagarBars(history: CheckinPost[], antal = 7): Bar[] {
  const byDate = new Map(history.map((post) => [post.date, post]));
  const idag = new Date();
  const bars: Bar[] = [];
  for (let i = antal - 1; i >= 0; i--) {
    const d = new Date(idag);
    d.setDate(idag.getDate() - i);
    const post = byDate.get(lokalDatum(d));
    const energi = post ? energiPct(beraknaStatusResultat(post.svar).poang) : null;
    bars.push({
      label: VECKODAG[d.getDay()],
      value: energi,
      highlight: i === 0 && energi != null,
      bubble: energi != null ? String(energi) : undefined,
    });
  }
  return bars;
}

const VECKA_LABELS = ["M", "T", "O", "T", "F", "L", "S"];

// Veckans pass (mån–sön) som staplar + total. Highlightar dagens stapel.
export function veckaBars(sessions: WorkoutSession[]): {
  bars: Bar[];
  weekCount: number;
} {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const todayIndex = (now.getDay() + 6) % 7;

  const counts = VECKA_LABELS.map((_, index) => {
    const start = new Date(monday);
    start.setDate(monday.getDate() + index);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    return sessions.filter((session) => {
      const date = new Date(session.date);
      return date >= start && date < end;
    }).length;
  });

  const maxCount = Math.max(1, ...counts);
  const bars: Bar[] = counts.map((count, index) => ({
    label: VECKA_LABELS[index],
    value: count ? Math.max(40, (count / maxCount) * 100) : null,
    highlight: index === todayIndex && count > 0,
    bubble: count ? String(count) : undefined,
  }));

  return { bars, weekCount: counts.reduce((sum, count) => sum + count, 0) };
}
