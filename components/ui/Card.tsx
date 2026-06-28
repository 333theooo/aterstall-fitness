import type { HTMLAttributes } from "react";

// Kort-primitiv (§5). Enda kort-systemet i appen: "raised" = .surface
// (gradient + skugga), "subtle" = .surface-subtle (inre yta). Padding via
// en namngiven skala istället för ad-hoc p-* per anrop.

type CardVariant = "raised" | "subtle";
type CardPadding = "none" | "sm" | "md" | "lg";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-5 sm:p-6",
};

export default function Card({
  variant = "raised",
  padding = "md",
  className = "",
  children,
  ...rest
}: CardProps) {
  const surface = variant === "raised" ? "surface" : "surface-subtle";
  return (
    <div className={`${surface} ${PADDING[padding]} ${className}`} {...rest}>
      {children}
    </div>
  );
}
