import type { ButtonHTMLAttributes, ReactNode } from "react";

// Knapp-primitiv (§5). En enda CTA-stil i hela appen — slutet på cream-vs-lime-
// splitten. Tryck krymper (.press). Skuggor/glow är tillåtna i v2.
//
//  primary   = lime --accent + mörk text, valfri glow. Max en per skärm.
//  secondary = lyft yta (--bg-elevated) + primär text.
//  status    = statusfärgad kant + text (Redo/Gränsfall/Vila).
//  quiet     = bara text, ingen yta.

type ButtonVariant = "primary" | "secondary" | "status" | "quiet";
type ButtonAlign = "center" | "between";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  align?: ButtonAlign;
  statusColor?: string; // krävs för variant="status"
  glow?: boolean; // mjuk glow på primary
  children: ReactNode;
}

const BASE =
  "press w-full select-none px-5 py-4 text-body font-semibold disabled:opacity-40 disabled:pointer-events-none";

export default function Button({
  variant = "primary",
  align = "between",
  statusColor,
  glow = false,
  className = "",
  style,
  children,
  ...rest
}: ButtonProps) {
  if (variant === "quiet") {
    return (
      <button
        className={`press w-full py-3 text-center text-bodysm text-text-secondary hover:text-text-primary ${className}`}
        style={style}
        {...rest}
      >
        {children}
      </button>
    );
  }

  const layout =
    align === "center"
      ? "flex items-center justify-center gap-2"
      : "flex items-center justify-between gap-4";

  const radius = { borderRadius: "var(--radius-btn)" };

  if (variant === "status") {
    return (
      <button
        className={`${BASE} ${layout} border bg-bg-raised ${className}`}
        style={{ color: statusColor, borderColor: statusColor, ...radius, ...style }}
        {...rest}
      >
        {children}
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        className={`${BASE} ${layout} border border-separator bg-bg-elevated text-text-primary ${className}`}
        style={{ ...radius, ...style }}
        {...rest}
      >
        {children}
      </button>
    );
  }

  // primary
  return (
    <button
      className={`${BASE} ${layout} ${glow ? "animate-glow-pulse" : ""} ${className}`}
      style={{
        backgroundColor: "var(--accent)",
        color: "var(--bg)",
        ...radius,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
