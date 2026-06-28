import Link from "next/link";
import type { Metadata } from "next";
import { isPaidSession, stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Återställningsprotokollet",
  robots: { index: false },
};

function Avsnitt({
  rubrik,
  children,
}: {
  rubrik: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-subheading text-text-primary">{rubrik}</h2>
      <div className="mt-3 flex flex-col gap-3 text-body text-text-secondary">
        {children}
      </div>
    </section>
  );
}

export default async function Dokument({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; dev?: string }>;
}) {
  const { session_id, dev } = await searchParams;
  const devLage = dev === "1" || !stripeEnabled();
  const betald =
    devLage || (session_id ? await isPaidSession(session_id) : false);

  if (!betald) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12 md:px-6">
        <h1 className="text-heading text-text-primary">Låst</h1>
        <p className="mt-4 mb-8 max-w-sm text-body text-text-secondary">
          Protokollet öppnas efter köp.
        </p>
        <Link
          href="/protokollet"
          className="press inline-flex min-h-11 items-center text-bodysm"
          style={{ color: "var(--redo)" }}
        >
          Till köpsidan
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-14 md:px-6">
      <article>
        <p className="text-caption uppercase tracking-[0.06em] text-text-tertiary">
          Återställningsprotokollet
        </p>
        <h1 className="mt-3 text-hero text-text-primary">Läs kroppens signaler.</h1>
        <p className="mt-5 text-body text-text-secondary">
          Det mesta som säger åt dig att träna kommer utifrån — ett schema, en
          siffra, en känsla av att du borde. Det här protokollet vänder på det.
          Du lär dig läsa de tre signaler som faktiskt avgör hur du mår idag,
          och vad du gör med svaret.
        </p>

        <Avsnitt rubrik="1. De tre signalerna">
          <p>
            Du behöver inga mätare. Tre frågor räcker, och du kan svara på dem
            på tio sekunder innan du ens har klivit upp.
          </p>
          <p>
            <strong className="text-text-primary">Sömn.</strong> Inte exakt
            antal timmar — utan om du vaknade återställd eller inte. Tänk i tre
            lägen: utvilad, halvbra, knappt sov.
          </p>
          <p>
            <strong className="text-text-primary">Trötthet just nu.</strong>{" "}
            Kroppen, inte humöret. Pigg, helt okej, lite tung, eller slut.
          </p>
          <p>
            <strong className="text-text-primary">
              Senaste passets belastning.
            </strong>{" "}
            Var det tungt, medel, eller lätt/inget? Färsk tung belastning är ett
            skäl att backa även när allt annat känns bra.
          </p>
        </Avsnitt>

        <Avsnitt rubrik="2. Statusmodellen">
          <p>
            Väg ihop de tre. Ge sömn och trötthet störst vikt, belastning
            mindre. Du landar i en av tre statusar — och poängen är att det är
            EN status, inte en procentsiffra som låtsas vara exakt.
          </p>
          <p>
            <span style={{ color: "var(--redo)" }}>Redo</span> — sömnen höll och
            kroppen känns lätt. Du har marginal idag.
          </p>
          <p>
            <span style={{ color: "var(--gransfall)" }}>Gränsfall</span> — ingen
            toppdag, ingen dålig dag. Du väljer själv tempot.
          </p>
          <p>
            <span style={{ color: "var(--vila)" }}>Vila</span> — sömnbrist eller
            tung trötthet, ofta efter hård belastning. Kroppen ber om
            återhämtning.
          </p>
          <p>
            Enkel tumregel: två tydligt negativa signaler räcker för{" "}
            <span style={{ color: "var(--vila)" }}>Vila</span>. Två tydligt
            positiva räcker för <span style={{ color: "var(--redo)" }}>Redo</span>.
            Allt däremellan är{" "}
            <span style={{ color: "var(--gransfall)" }}>Gränsfall</span>.
          </p>
        </Avsnitt>

        <Avsnitt rubrik="3. Vad du gör vid varje status">
          <p>
            Allt här fungerar hemma, på fyra kvadratmeter, utan ljud och utan
            utrustning. Gym är undantaget, inte normen.
          </p>
          <p>
            <span style={{ color: "var(--redo)" }}>Redo</span> — ett fullt pass.
            Helkropp eller fokuserad överkropp, 15–18 minuter, med marginal att
            ta i.
          </p>
          <p>
            <span style={{ color: "var(--gransfall)" }}>Gränsfall</span> — lätt
            rörelse eller mobilitet, 10–14 minuter. Du bestämmer tempot, och att
            avstå är ett giltigt val.
          </p>
          <p>
            <span style={{ color: "var(--vila)" }}>Vila</span> — ingen träning.
            Andning och statisk stretch om du vill röra dig, annars ingenting.
            Det här ÄR dagens pass.
          </p>
        </Avsnitt>

        <Avsnitt rubrik="4. Om vila">
          <p>
            Vila är inte en paus från planen. Vila är planen. Det är där kroppen
            bygger tillbaka det träningen brutit ner. En dag du vilar rätt är
            lika produktiv som en dag du tränar rätt.
          </p>
          <p>
            Du missar ingenting genom att vila. Du missar något genom att köra
            över en kropp som signalerade stopp — och betalar för det i en vecka
            av sämre pass.
          </p>
        </Avsnitt>

        <Avsnitt rubrik="5. Det enda du behöver hålla igång">
          <p>
            Checka in varje dag. Inte träna varje dag — checka in. Att läsa av
            sig själv är vanan som bär, och en vilodag bryter den aldrig.
          </p>
          <p>
            Över tid ser du ditt eget mönster: hur sömnen styr statusen, vilka
            veckor som tär, när du återhämtar snabbt. Det är belöningen — inte en
            siffra, utan att du börjar känna igen dig själv.
          </p>
        </Avsnitt>

        <p className="mt-12 text-bodysm text-text-tertiary">
          Återställ · Återställningsprotokollet
        </p>
      </article>
    </main>
  );
}
