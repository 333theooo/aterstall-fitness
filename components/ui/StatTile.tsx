import type { ReactNode } from "react";
import Card from "./Card";

// Stat-tal (§4 statistik-rad). Ikon + etikett + stort tal + enhet.
// Delas mellan hem och Historik så siffer-korten ser likadana ut.

interface StatTileProps {
  icon: ReactNode;
  label: string;
  value: string;
  unit?: string;
}

export default function StatTile({ icon, label, value, unit }: StatTileProps) {
  return (
    <Card padding="sm">
      <div className="flex items-center gap-2 text-text-secondary">
        <span className="text-accent">{icon}</span>
        <span className="text-caption">{label}</span>
      </div>
      <p className="mt-3 text-heading text-text-primary">
        {value}
        {unit && (
          <span className="ml-1 text-bodysm font-normal text-text-tertiary">
            {unit}
          </span>
        )}
      </p>
    </Card>
  );
}
