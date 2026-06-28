import Button from "./ui/Button";
import { PLANS, formatSEK } from "@/lib/pricing";

// Valfri paywall vid start. Tydlig "fortsätt gratis"-väg, ingen mörk UX.

interface Props {
  onValj: (plan: "year" | "month" | null) => void;
}

export default function OnboardingPaywall({ onValj }: Props) {
  const yearKr = formatSEK(PLANS.year.amount);
  const monthEqKr = formatSEK(PLANS.year.monthlyEquivalent);
  const monthKr = formatSEK(PLANS.month.amount);

  return (
    <div className="flex h-full flex-col justify-between px-5 py-10 md:px-6">
      <div>
        <p className="mb-2 text-caption uppercase tracking-[0.06em] text-text-tertiary">
          Innan du börjar
        </p>
        <h1 className="text-heading text-text-primary">
          Vill du låsa upp allt direkt?
        </h1>
        <p className="mt-4 max-w-sm text-body text-text-secondary">
          Gratis ger dig check-in och ett pass per nivå. Premium ger hela
          passbanken och dina mönster över tid — direkt, utan att vänta.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => onValj("year")}
          className="press tile w-full px-5 py-4 text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body font-medium text-text-primary">
                {PLANS.year.label}
              </p>
              <p className="mt-0.5 text-bodysm text-text-secondary">
                {yearKr}/år · {monthEqKr}/mån
              </p>
            </div>
            <span className="text-bodysm font-semibold text-redo">
              Spara {PLANS.year.savingsPercent} %
            </span>
          </div>
        </button>

        <button
          onClick={() => onValj("month")}
          className="press tile w-full px-5 py-4 text-left"
        >
          <p className="text-body font-medium text-text-primary">
            {PLANS.month.label}
          </p>
          <p className="mt-0.5 text-bodysm text-text-secondary">{monthKr}/mån</p>
        </button>

        <Button variant="quiet" onClick={() => onValj(null)}>
          Fortsätt gratis
        </Button>
      </div>
    </div>
  );
}
