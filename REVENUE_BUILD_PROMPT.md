# PROMPT → Claude Code: Bygg hela intäktslagret för Återställ

> Klistra in i Claude Code i detta repo. Bygg **en chunk i taget**, verifiera mot
> acceptanskriterierna, gå vidare. Läs `CLAUDE.md`, `STYLE_BIBLE_v2.md` och
> `MONETIZATION.md` innan första raden kod.

---

## Roll & tankesätt

Du är senior betalnings-ingenjör **och** prenumerations-ekonom. Du bygger inte
"en betalknapp" — du bygger ett intäktssystem som maximerar **LTV = ARPU ×
livslängd** utan att bryta varumärket. Varje beslut vägs mot fyra hävstänger:

1. **Annual mix** — årsplan ger kontanter direkt och dödar churn. Årsplan är
   default överallt, månad är undantaget.
2. **Konvertering vid peak value** — paywall visas i ögonblicket värdet känns
   som störst, aldrig slumpmässigt.
3. **Ofrivillig churn** — misslyckade kort är 20–40 % av all churn. Den ska
   fångas (dunning) i appen, eftersom vi saknar e-post.
4. **Frivillig churn** — "pausa" slår "säg upp". Lugnt save-erbjudande, aldrig
   skuld eller countdown.

Hård regel: **allt mätbart.** Om en intäktshändelse inte loggas, existerar den
inte. Och: ingen dark pattern får varumärket att tappa förtroende — lugnet är
produkten.

## Befintlig arkitektur (läs filerna, anta inget)

- `lib/stripe.ts` — `stripeEnabled`, `getStripe`, `priceForPlan(plan)`, `baseUrl`,
  `isPaidSession`. `Plan = "month" | "year"` i `lib/types.ts`.
- `app/api/checkout/route.ts` — prenumerations-Checkout, verifierar user via
  Supabase access-token, återanvänder/skapar `stripe_customer_id`.
- `app/api/protokoll-checkout/route.ts` — engångsköp 19 kr, **anonymt**, ingen
  Supabase.
- `app/api/webhook/route.ts` — sätter `premium` (service role). Hanterar idag
  `customer.subscription.*` + `checkout.session.completed`. **Ingen idempotens,
  inga period-/dunning-fält.**
- `app/api/portal/route.ts` — Stripe billing portal.
- `supabase/schema.sql` — `profiles(user_id, premium, stripe_customer_id,
  subscription_status, created_at, updated_at)` + `checkins`. RLS på.
- `app/protokollet/tack/page.tsx` — efter engångsköp. **Ingen upsell idag.**
- `components/UppgraderaModal.tsx` — säljer **bara** 99 kr/mån. `OnboardingPaywall`
  visar år + månad.
- `app/page.tsx` — skedesmaskin; paywall öppnas via `setVisaUppgradera(true)`
  (idag bara på låst pass och i `InsikterVy`).
- Anonym auth (`lib/supabase/client.ts`) → **ingen e-post finns.** Dunning,
  win-back och reaktivering måste ske **in-app + web-push** (PWA-manifest finns
  i `app/manifest.ts`). localStorage-fallback i `lib/storage.ts` för dev.

## Globala principer (gäller alla chunks)

- Engelska identifierare, svenska för affärslogik-kommentarer och all UI-copy.
- Inga `any`, riktiga interfaces, ingen tyst `catch {}` i betal-/persistenskod.
- `premium` sätts **endast** av webhooken (service role) — aldrig från klient.
- Priser/planer/feature-gates läses från **en** källa (Chunk A) — inga
  hårdkodade `99`, `790`, `1900` spridda i komponenter.
- Mobil-first, touch ≥ 44px, peak-value-paywall får aldrig blockera dagens
  check-in (gratisläget måste alltid fungera).

---

# CHUNKS (bygg i ordning, verifiera var för sig)

## Chunk A — Pris & plan: en sanningskälla
**Fil:** `lib/pricing.ts` (ny).
Exportera en typad config som ALL kod läser:
- `PLANS`: `year` (790 kr, `STRIPE_PRICE_YEAR`) och `month` (99 kr,
  `STRIPE_PRICE_MONTH`), med `monthlyEquivalent`, `savingsPercent` (år ≈ 34 %),
  `isDefault: true` på `year`.
- `FOUNDING`: grundarpris-config — `priceId` (`STRIPE_PRICE_YEAR_FOUNDING`),
  `amount` (default 590 kr), `enabled` (env-flagga), `label` ("Grundarpris,
  låst så länge du stannar"). **Ingen countdown, ingen falsk knapphet** — det är
  prislåsning, inte FOMO.
- `PROTOKOLL`: 19 kr (flytta hit från `protokoll-checkout`).
- `formatSEK(amount)` helper.
- `priceForPlan` i `lib/stripe.ts` läser härifrån; founding-pris väljs när
  `FOUNDING.enabled`.

**Accept:** inga prisliteraler kvar i komponenter/route-filer; `tsc` rent.

## Chunk B — Datamodell för intäkt
**Fil:** `supabase/schema.sql` (utöka, idempotent `alter table`-block) + ny migration-kommentar.
1. Utöka `profiles`: `plan text`, `price_id text`, `current_period_end timestamptz`,
   `cancel_at_period_end boolean default false`, `founding_member boolean default false`,
   `last_payment_status text`, `pause_until timestamptz`.
2. Ny tabell `revenue_events`:
   `id uuid pk`, `user_id uuid null` (null = anonym protokoll-köpare),
   `type text` (se eventlista nedan), `source text` (var i appen),
   `amount int null`, `currency text null`, `meta jsonb default '{}'`,
   `created_at timestamptz default now()`. Index på `(type, created_at)`.
3. RLS: klient får **insert** av egna funnel-events (`auth.uid() = user_id`),
   men **ingen** läsrättighet (analys sker via service role). Webhook/server
   skriver via service role.

**Eventtyper (kanon):** `paywall_shown`, `paywall_dismissed`,
`checkout_started`, `checkout_completed`, `subscription_canceled`,
`subscription_paused`, `payment_failed`, `payment_recovered`, `reactivated`,
`protokoll_purchased`, `bridge_offer_shown`, `bridge_offer_taken`.

**Accept:** schema körbart i Supabase SQL Editor utan fel; RLS testad så att en
anon-nyckel inte kan läsa `revenue_events`.

## Chunk C — Härda webhooken (intäktens sanning)
**Fil:** `app/api/webhook/route.ts`.
1. **Idempotens:** dedupe på `event.id` (liten `processed_events`-tabell eller
   upsert-guard) så ett omsänt event aldrig dubbel-skriver.
2. Lagra hela prenumerations-sanningen vid `customer.subscription.*`:
   `plan` (härled från price-id via Chunk A), `price_id`, `current_period_end`,
   `cancel_at_period_end`, `subscription_status`, `founding_member` (true om
   founding price-id).
3. Lägg till events:
   - `invoice.payment_failed` → `last_payment_status = "failed"`, logga
     `payment_failed`. **Premium tas INTE bort direkt** (Stripe gör retries);
     premium släcks först när status blir `unpaid`/`canceled`.
   - `invoice.payment_succeeded` → `last_payment_status = "paid"`, logga
     `payment_recovered` om föregående var failed.
   - `customer.subscription.paused` / `resumed` → spegla i profil.
4. Skriv motsvarande `revenue_events` (server-truth) för completed/canceled/
   paused/failed/recovered.

**Accept:** `stripe listen --forward-to localhost:3000/api/webhook` + utlösta
test-events flippar fälten korrekt; samma event två gånger ger ingen
dubbelskrivning.

## Chunk D — Checkout: årsplan-default, founding, telemetri
**Fil:** `app/api/checkout/route.ts` + `lib/data.ts`.
1. Default `plan = "year"` när inget anges; founding price-id väljs när
   `FOUNDING.enabled`.
2. Sätt `subscription_data.metadata.user_id` + `plan` (finns delvis) och
   `allow_promotion_codes` (finns).
3. **Ingen tidsbestämd trial** (freemium är vår trial; timade trials = ofrivillig
   churn + press off-brand). Lämna en `TRIAL_DAYS`-konstant = 0 i `lib/pricing.ts`
   så det går att A/B-testa senare utan kodändring.
4. Logga `checkout_started` (klient, före redirect) och låt webhooken äga
   `checkout_completed`.

**Accept:** köp av årsplan i testläge → webhook sätter `plan="year"`,
`founding_member` korrekt, premium = true.

## Chunk E — Bryggan: protokoll-köpare → årsprenumeration  *(störst ROI)*
**Fil:** `app/protokollet/tack/page.tsx` + ny `components/BroOffer.tsx` + ev. liten
`app/api/bridge-event/route.ts` (anonym event-logg via admin).
1. På tack-sidan (efter verifierat köp), under "Öppna protokollet": ETT lugnt
   erbjudande, i röst — t.ex. *"Appen gör det här åt dig, varje morgon. Som tack:
   första året till grundarpris, låst så länge du stannar — 590 kr."*
2. CTA → startar prenumerations-checkout (årsplan, founding). Eftersom köparen är
   anonym och kanske saknar app-session: skicka dem till appens onboarding med en
   `?offer=founding`-flagga som förvald årsplan, ELLER direkt Checkout om vi kan
   skapa kund utan user — välj det som håller `premium`-säkerheten intakt och
   motivera valet i leveransrapporten.
3. Logga `bridge_offer_shown` (render) och `bridge_offer_taken` (klick).
4. Max **en** primär handling kvar på sidan (öppna protokollet) + erbjudandet
   tydligt sekundärt-men-synligt. Får inte kännas som tjat.

**Accept:** tack-sidan visar erbjudandet endast vid betald/dev-session; klick
leder till årsplan-checkout med founding-pris; events loggas.

## Chunk F — Paywall vid peak value, förankrad i insikt
**Fil:** `app/page.tsx`, `components/UppgraderaModal.tsx`, ny
`lib/paywall.ts` (trigger-logik).
1. `UppgraderaModal`: **årsplan-default** (790 kr, "spara 34 %", founding om på),
   månad som mindre sekundärval. Omformulera värdet kring **ditt mönster över
   tid** (sömn ↔ status, full historik) — passbanken är sekundär perk, inte
   huvudargument.
2. Trigger-logik (`shouldOfferPremium(state)`), visa modalen vid **peak value**,
   max en gång per dag, aldrig under check-in-flödet:
   - efter **3:e incheckningen** (mönsterdata blir meningsfull), och/eller
   - vid första **Vila**-statusen, men förankrat i insikt ("se ditt mönster"),
     **aldrig** "betala för att vila" — det vore varumärkesmord.
   - behåll befintlig trigger på låst pass.
3. Logga `paywall_shown` (med `source`) och `paywall_dismissed`.

**Accept:** modal dyker upp vid rätt trigger, ej oftare än 1/dag, check-in aldrig
blockerad; årsplan förvald; copy insikts-förankrad.

## Chunk G — Retention utan e-post: web-push + dunning/win-back in-app
**Fil:** `lib/push.ts` (ny), `app/api/push/subscribe/route.ts` (ny, lagra
push-subscription per user), `components/RevenueBanners.tsx` (ny), ev. service
worker-hook.
1. **Web-push (PWA):** be om tillåtelse vid ett lugnt ögonblick (efter en lyckad
   check-in, inte vid första öppning). Notiser i röst: *"Ingen press. Bara en
   fråga: hur sov du?"* Max sällan. Ingen spam.
2. **Dunning in-app:** om `last_payment_status = "failed"` → diskret banner:
   *"Din betalning gick inte igenom. Uppdatera kortet när du vill — premium är
   kvar tills vidare."* → länk till billing portal (`/api/portal`).
3. **Win-back/reaktivering:** om användaren tidigare haft `stripe_customer_id`
   men `premium = false` nu → lugnt återkomst-erbjudande (årsplan, ev. founding).
   Logga `reactivated` när det tas.
4. **Pausa > säg upp:** exponera Stripe `pause_collection` som alternativ i
   uppsägningsflödet (via portal eller egen knapp) → logga `subscription_paused`.

**Accept:** push-permission frågas vid rätt tillfälle; dunning-banner syns endast
vid failed; win-back endast för tidigare kund; allt loggas.

## Chunk H — Intäktstelemetri (så vi kan optimera)
**Fil:** `lib/analytics.ts` (ny, tunn `logRevenueEvent(type, payload)` → Supabase
insert eller `/api/bridge-event` för anonyma) + använd den i Chunks D–G.
Skapa även `app/api/metrics/route.ts` (skyddad, service role) som returnerar
grund-KPI:er: konvertering paywall→checkout, årsandel, MRR-proxy, dunning-recovery-
rate, bridge-take-rate. Enkel JSON räcker (ingen dashboard nu).

**Accept:** varje intäktshändelse i Chunks D–G hamnar i `revenue_events`;
`/api/metrics` räknar dem korrekt.

---

## FÖRBJUDET (bryter varumärket — bygg aldrig)
Streak som bestraffning, badges/leaderboards/utmaningar, kalori-/vikt-spårning,
före/efter-kroppar, countdowns, falsk knapphet ("bara idag!"), push-spam,
"betala för att vila"-inramning, guilt-trip i uppsägning. Var och en höjer churn
här även om den spikar en siffra.

## VALIDERING (kör innan du säger klart)
1. `npm run build` + `tsc` rent, inga oanvända imports/`console.log`.
2. Stripe testläge: köp år (founding på/av), trigga `invoice.payment_failed` →
   recovered, `customer.subscription.deleted` → premium släcks. Idempotens: skicka
   samma event-id två gånger.
3. Verifiera att `premium` INTE kan sättas via anon-nyckel (försök direkt skrivning).
4. Mobil-viewport 375–414px: paywall, bro-erbjudande, banners — touch ≥ 44px,
   check-in aldrig blockerad.
5. Bekräfta `revenue_events` fylls och `/api/metrics` räknar.

## LEVERANSFORMAT (per CLAUDE.md, efter varje chunk)
Ändrade/skapade filer · vad som byggdes (en mening) · vad som INTE testats mot
riktig Stripe-sandbox · nästa rekommenderade steg. Inga ursäkts-loopar.

## SUCCESS CONDITION
Ett komplett, mätbart intäktslager: årsplan-default + founding price-lock,
protokoll→prenumerations-brygga, peak-value insikts-paywall, robust webhook med
dunning, in-app win-back/pausa, och full `revenue_events`-telemetri — allt
varumärkeskongruent (noll dark patterns) och `premium` skyddat på service-role.
```

---

### Körordning (rekommenderad)
A → B → C → D → **E (störst ROI, kör tidigt om du bara hinner en sak)** → F → G → H.
```
