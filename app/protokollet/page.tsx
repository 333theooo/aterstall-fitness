import type { Metadata } from "next";
import { ArrowDown, BookOpen, CheckCircle2, Moon, Shield } from "lucide-react";
import KopKnapp from "./KopKnapp";

export const metadata: Metadata = {
  title: "Återställningsprotokollet",
  description:
    "Läs kroppens signaler och bygg din återhämtning. Ett protokoll, inget tjat.",
  openGraph: {
    title: "Återställningsprotokollet",
    description:
      "Läs kroppens signaler och bygg din återhämtning. Ett protokoll, inget tjat.",
  },
};

const INNEHALL = [
  "Läs sömn, trötthet och belastning utan mätare.",
  "Gör statusmodellen Redo / Gränsfall / Vila själv.",
  "Välj hemmarutin efter status: fullt, lätt eller ingen träning.",
  "Förstå vila utan skuld eller förhandlande.",
];

export default function ProtokolletLanding() {
  return (
    <main className="app-shell min-h-dvh px-4 py-6 sm:px-6 lg:py-10">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface flex flex-col justify-between p-5 sm:p-7">
          <div>
            <div className="mb-12 flex items-center justify-between">
              <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
                Återställningsprotokollet
              </p>
              <div className="tile flex h-11 w-11 items-center justify-center text-focus">
                <BookOpen size={20} strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="max-w-2xl text-heading text-text-primary sm:text-hero">
              Läs kroppens signaler innan du låter pressen bestämma.
            </h1>
            <p className="mt-5 max-w-xl text-body text-text-secondary">
              Hela metoden bakom Återställ, samlad som ett kort protokoll. För
              dagar när du vill veta om du ska köra, skala ner eller vila.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3">
            <div className="surface-subtle p-4">
              <Shield size={19} strokeWidth={1.5} className="text-vila" />
              <p className="mt-4 text-bodysm font-medium text-text-primary">
                Inget gymkrav
              </p>
            </div>
            <div className="surface-subtle p-4">
              <Moon size={19} strokeWidth={1.5} className="text-gransfall" />
              <p className="mt-4 text-bodysm font-medium text-text-primary">
                Vila får vara svar
              </p>
            </div>
            <div className="surface-subtle p-4">
              <ArrowDown size={19} strokeWidth={1.5} className="text-redo" />
              <p className="mt-4 text-bodysm font-medium text-text-primary">
                Lägre friktion
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-4">
          <section className="surface p-5">
            <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
              Ingår
            </p>
            <div className="mt-5 grid gap-3">
              {INNEHALL.map((rad) => (
                <div key={rad} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-bg-elevated text-vila">
                    <CheckCircle2 size={14} strokeWidth={1.6} />
                  </span>
                  <p className="text-body text-text-primary">{rad}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface p-5">
            <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
              Engångsköp
            </p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-heading text-text-primary">19 kr</p>
                <p className="mt-2 text-bodysm text-text-secondary">
                  Ingen prenumeration. Direkt åtkomst efter köp.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <KopKnapp />
            </div>
          </section>

          <section className="surface-subtle p-5">
            <p className="text-bodysm text-text-secondary">
              Protokollet är fristående från appen. Det är snabbvägen till
              metoden, inte ännu en sak att prestera i.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
