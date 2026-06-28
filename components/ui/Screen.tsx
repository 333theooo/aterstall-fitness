import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

// Sid-skal. En enda bredd-, padding- och nav-clearance-regel för alla
// dashboard-skärmar så att layouten slutar divergera per fil (§1, §4).
// "narrow" = mobil-first enkolumn. "wide" = skärmar med två kolumner på lg
// (Status, Pass) — samma padding/clearance, bredare bara på stora skärmar.

type ScreenWidth = "narrow" | "wide";

interface ScreenProps {
  children: ReactNode;
  width?: ScreenWidth;
  onBack?: () => void;
  className?: string;
}

const MAX_WIDTH: Record<ScreenWidth, string> = {
  narrow: "max-w-2xl",
  wide: "max-w-5xl",
};

export default function Screen({
  children,
  width = "narrow",
  onBack,
  className = "",
}: ScreenProps) {
  return (
    <div
      className={`mx-auto w-full ${MAX_WIDTH[width]} px-5 pb-28 pt-5 sm:pt-8 lg:pb-14 ${className}`}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="press mb-5 flex min-h-11 items-center gap-2 text-bodysm text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Tillbaka
        </button>
      )}
      {children}
    </div>
  );
}
