// Ren streak-logik, delad mellan localStorage- och Supabase-vägen.
// Streak = antal kalenderdagar i RAD med en incheckning. Tolerant: lever
// kvar om man inte checkat in idag men gjorde igår. Vila bryter aldrig —
// det är incheckning som räknas, inte träning.

export function lokalDatum(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeStreak(dates: Iterable<string>): number {
  const set = new Set(dates);
  if (set.size === 0) return 0;

  const start = new Date();
  if (!set.has(lokalDatum(start))) {
    start.setDate(start.getDate() - 1);
    if (!set.has(lokalDatum(start))) return 0;
  }

  let streak = 0;
  const cursor = new Date(start);
  while (set.has(lokalDatum(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
