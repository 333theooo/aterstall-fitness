import Link from "next/link";
import type { Metadata } from "next";
import { isPaidSession, stripeEnabled } from "@/lib/stripe";
import BrygganErbjudande from "@/components/BrygganErbjudande";

export const metadata: Metadata = {
  title: "Tack — Återställningsprotokollet",
  robots: { index: false },
};

export default async function Tack({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; dev?: string }>;
}) {
  const { session_id, dev } = await searchParams;

  const devLage = dev === "1" || !stripeEnabled();
  const betald = devLage || (session_id ? await isPaidSession(session_id) : false);

  const dokumentHref = session_id
    ? `/protokollet/dokument?session_id=${encodeURIComponent(session_id)}`
    : "/protokollet/dokument?dev=1";

  return (
    <main className="mx-auto w-full max-w-md px-5 py-12 md:px-6">
      {betald ? (
        <div className="animate-enter">
          <p className="mb-3 text-caption uppercase tracking-[0.06em] text-text-tertiary">
            Klart
          </p>
          <h1 className="text-heading text-text-primary">Tack — det är ditt.</h1>
          <p className="mt-4 mb-8 max-w-sm text-body text-text-secondary">
            Protokollet är upplåst. Läs det när du vill, spara sidan eller skriv
            ut den.
          </p>
          <Link
            href={dokumentHref}
            className="press flex w-full items-center justify-between rounded-[var(--radius-btn)] bg-bg-raised px-6 py-4 text-subheading font-semibold"
            style={{ color: "var(--redo)", border: "1px solid var(--redo)" }}
          >
            <span>Öppna protokollet</span>
            <span aria-hidden>→</span>
          </Link>

          {/* Bryggan: protokoll-köpare → app-prenumeration (högst ROI) */}
          <BrygganErbjudande />
        </div>
      ) : (
        <div className="animate-enter">
          <h1 className="text-heading text-text-primary">Köpet hittades inte</h1>
          <p className="mt-4 mb-10 max-w-sm text-body text-text-secondary">
            Vi kunde inte bekräfta betalningen. Har du redan betalat, ladda om
            sidan om en stund.
          </p>
          <Link
            href="/protokollet"
            className="press inline-flex min-h-11 items-center text-bodysm text-text-secondary"
          >
            Tillbaka
          </Link>
        </div>
      )}
    </main>
  );
}
