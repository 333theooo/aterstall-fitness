import type { ReactNode } from "react";

// Hårfint avgränsad lista (§5). Ersätter staplar av kant-i-kant-boxar med
// rena rader separerade av en hårlinje — lättare att läsa, mindre brus.
// Ligger inuti ETT kort; raderna har ingen egen kant.

export function DividedList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`divide-y divide-separator ${className}`}>{children}</div>
  );
}

export function DividedRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 py-3 first:pt-0 last:pb-0 ${className}`}>
      {children}
    </div>
  );
}
