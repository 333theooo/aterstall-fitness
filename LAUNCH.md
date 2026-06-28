# Lansering — Återställ

Två oberoende lanseringar. Protokollet kan gå live **innan** app-MVP:n är
klar — det är snabbaste vägen till första sales.

## Spår A — Återställningsprotokollet (gå först)

Allt detta fungerar utan Supabase. Bara Stripe behövs.

1. **Stripe**
   - Skapa produkten "Återställningsprotokollet" + ett engångspris (9–19 kr).
     Lägg pris-id i `STRIPE_PRICE_PROTOKOLL` (valfritt — annars inline 19 kr).
   - `STRIPE_SECRET_KEY` (live) i Vercel-env.
2. **Vercel**
   - Importera repo, deploya. Sätt `NEXT_PUBLIC_BASE_URL` till prod-domänen.
   - Verifiera flöde: `/protokollet` → köp → `/protokollet/tack` →
     `/protokollet/dokument`.
3. **Dela** `/protokollet`-länken i TikTok-bio. Det är hela säljtratten.

> Webhook behövs INTE för protokollet — leverans gateas av betald
> Checkout-session (`isPaidSession`).

## Spår B — Appen (check-in + status + pass + premium)

1. **Supabase**
   - Nytt projekt. Auth → Providers → aktivera **Anonymous sign-ins**.
   - Kör `supabase/schema.sql` i SQL Editor.
   - Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `SUPABASE_SERVICE_ROLE_KEY`.
2. **Stripe prenumeration**
   - Två återkommande priser: 99 kr/mån, 790 kr/år →
     `STRIPE_PRICE_MONTH`, `STRIPE_PRICE_YEAR`.
   - Webhook-endpoint → `https://DOMÄN/api/webhook`, events:
     `checkout.session.completed`, `customer.subscription.created/updated/deleted`.
     Signing secret → `STRIPE_WEBHOOK_SECRET`.
3. **Verifiera**
   - Onboarding → "Fortsätt gratis" → check-in → status → pass.
   - Köp premium (testkort) → webhook flippar `profiles.premium` → låsta pass
     öppnas.
   - PWA: DevTools → Application → Manifest installerbar, theme `#15171C`.

## Env-sammanfattning (Vercel)

Se `.env.example`. Klientvariabler (`NEXT_PUBLIC_*`) måste sättas vid
build-tid i Vercel.

## Efter go-live

- Bekräfta att `premium`-flaggan ALDRIG kan sättas från klienten (endast
  webhook/service-role). Testa genom att neka direkt skrivning via anon-nyckel.
- Kontrollera att en vilodag inte bryter streaken i prod (kärnlöfte).
