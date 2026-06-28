# Återställ

Svensk träningsapp för bekvämlighet och anonymitet. Daglig check-in (sömn,
trötthet, senaste passets belastning) → transparent status (Redo / Gränsfall
/ Vila) → ett pass anpassat efter statusen. Hemma/rum-träning är default.

All visuell implementation styrs av `../STYLE_BIBLE.md`. Logik/flöde härstammar
från prototypen `../aterstall-app.jsx` (dess visuella del används inte).

## Kom igång

```bash
npm install
npm run dev
```

Öppna http://localhost:3000. Utan miljövariabler kör appen mot **localStorage**
(lokal dev/demo) och premium kan aktiveras lokalt utan riktig betalning.

## Arkitektur

| Lager | Plats |
|---|---|
| Designtokens | `app/globals.css` (Tailwind v4 `@theme`) |
| Statusmotor | `lib/status.ts` (transparent poängmodell) |
| Passbank | `lib/passbank.ts` |
| Datalager (async, moln/lokal) | `lib/data.ts` → Supabase eller `lib/storage.ts` |
| Streak (delad ren logik) | `lib/streak.ts` |
| Skärmar | `components/*` + `app/page.tsx` (skedesmaskin) |
| Betalning | `app/api/checkout`, `app/api/webhook`, `app/api/portal` |

## Persistens (Supabase)

1. Skapa ett Supabase-projekt. Aktivera **Anonymous sign-ins** (Auth →
   Providers). Appen är anonym: ingen e-post/lösenord, en `auth.users`-rad
   per enhet via anonym inloggning.
2. Kör `supabase/schema.sql` i SQL Editor (tabeller `profiles` + `checkins`,
   RLS, auto-profil-trigger).
3. Fyll i `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` i `.env.local` (se `.env.example`).

Streak = incheckade dagar i rad. **En vilodag bryter aldrig streaken** —
det är incheckning som räknas, inte träning.

## Betalning (Stripe)

1. Skapa två återkommande priser (99 kr/mån, 790 kr/år) i Stripe Dashboard.
   Lägg pris-id i `STRIPE_PRICE_MONTH` / `STRIPE_PRICE_YEAR`.
2. Sätt `STRIPE_SECRET_KEY` och `NEXT_PUBLIC_BASE_URL`.
3. Webhook → `POST /api/webhook`, lyssna på `customer.subscription.*` och
   `checkout.session.completed`. Lägg signing secret i `STRIPE_WEBHOOK_SECRET`.
   Lokalt: `stripe listen --forward-to localhost:3000/api/webhook`.

Premium-flaggan i `profiles` sätts **endast** av webhooken (service role),
aldrig från klienten. Köp kan ske vid onboarding (valfritt, tydlig "fortsätt
gratis") eller organiskt när samma pass setts förut.

## Bygg

```bash
npm run build
```
