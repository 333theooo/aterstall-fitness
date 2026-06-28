# MONETIZATION — Återställ

Strategy doc. Ranked by leverage. Every lever passes one test before it ships:
**does it add pressure?** If yes, it raises churn even when it spikes a metric —
because the brand exists to remove pressure. That constraint is not a limit on
monetization, it *is* the monetization. Calm is the moat; protect it and charge
for it.

---

## The core mechanism

You are not selling workouts. Workouts are commodity — every app has them.
You are selling **permission to stop overriding your own signal**, and a
**status engine** that makes that decision for the user every morning. That
engine is the moat. The workout bank is the giveaway.

So the strategic question is not "how do I sell more workouts." It is:
**how do I monetize the engine and the relief it produces, without becoming the
pushy fitness app the brand was built to oppose.**

---

## Where the money actually is — and where it leaks today

1. **Biggest leak: protokoll → subscription bridge is missing.** A 19 kr
   protokoll buyer has *proven they pay*. They are the warmest lead you will
   ever have. Today the `/protokollet/tack` + `/dokument` flow delivers the PDF
   and stops. You acquire a buyer and drop them. This is the single highest-ROI
   fix and it needs zero new infrastructure (Stripe only).

2. **No contact channel = LTV ceiling.** Anonymous auth is a real brand asset,
   but taken literally everywhere it strangles lifetime value: no win-back, no
   churned-user re-sell, no launch list, no lifecycle. No contact = no second
   chance to sell. This is the quiet killer.

3. **In-app upgrade sells the wrong plan.** `UppgraderaModal` only offers
   99 kr/mån. Annual (790 kr) is where the cash and the anti-churn live, and
   it's buried. The onboarding paywall shows year-first (correct) — the in-app
   one contradicts it.

4. **Premium is framed as "more workouts" (commodity) instead of "your pattern
   over time" (the moat).** Workouts are finite — the user exhausts the value.
   Insight *compounds* with tenure: the longer they stay, the more their own
   data is worth. Insight-anchored premium has structurally lower churn. You're
   currently paywalling the weak half and giving away the strong half.

5. **The 19 kr tripwire has no AOV ladder.** Its job is to convert a follower
   into a buyer — fine, keep it cheap. But there's no order-bump, no bundle, no
   "you already started" annual offer at the one moment the wallet is open.

---

## Levers, ranked by leverage

### 1. Bridge the protokoll buyer into the subscription  *(do this first)*
Highest ROI, lowest effort, zero brand risk, no new infra.
- On the `tack` page (post-purchase), make a single calm offer: *"Appen gör det
  här åt dig automatiskt, varje morgon. Som tack för protokollet: första året
  till grundarpris, låst så länge du stannar."*
- Add a Stripe order-bump or post-purchase upsell to annual.
- Mechanism: even 15–20% of protokoll buyers taking annual moves AOV per buyer
  from 19 kr to ~150+ kr. That is the whole game.

### 2. Add a re-engagement channel that doesn't break anonymity
Retention *is* the subscription business. Today there's no way to bring a user
back.
- **Web-push (PWA already has the manifest).** Brand-perfect: silent, no PII, in
  voice — *"Ingen press. Bara en fråga: hur sov du?"* A recovery app that nudges
  gently is on-brand; one that nags is dead. This alone moves retention.
- **Optional email, framed as utility not signup:** "Få ditt veckomönster via
  mejl." Even 20–30% opt-in gives you a win-back + launch list without touching
  the anonymous-by-default promise.

### 3. Make annual the default everywhere + founding price-lock
- Annual-first in `UppgraderaModal`, not monthly.
- **Grundarpris** during launch (e.g. 590 kr första året, locked while
  subscribed). This creates urgency *through price-lock*, not FOMO — congruent
  with "lugnet är varumärket." Banks cash up front, kills churn.

### 4. Move the conversion trigger to peak value, re-anchored on insight
- Don't fire the paywall on "you want another workout." Fire it at the moment of
  maximum felt value: right after a **Vila** status (the relief moment), or at
  the **3rd check-in** when pattern data first becomes real.
- Reframe premium copy around *your pattern over time* (sleep ↔ status, what
  your week actually looks like), with the workout bank as the secondary perk.

### 5. Expand the catalog into on-brand verticals  *(next quarter)*
The engine + voice spawn niche protocols, each a one-time (19–49 kr) or a
premium module — laddering AOV and opening high-intent verticals:
- **Återställ efter förlossning (postpartum return).** Underserved, high
  willingness to pay, *perfectly* on-brand: pressure-free return to movement.
  Strongest single expansion.
- **Återställ efter sjukdom/förkylning** (return after illness).
- **Återställ för löpare** (deload / when-not-to-run guidance).
- **Sömnskuld-protokoll.**
- **Premium röstguide (real voice, not TTS).** The app already has an audio
  guide hook. A calm human-voice recovery session is sticky, recurring, and
  exactly the silent-home-training fantasy. Strong premium differentiator.

### 6. Distribution through trust, not ads  *(parallel, low-CAC)*
- **Clinician channel:** physios, postpartum clinics, burnout/ED-recovery
  therapists need a movement tool that *doesn't push*. That's literally you.
  Referral or light white-label. High-trust, near-zero CAC.
- **Gift subscriptions** ("ge någon tillåtelse att vila").

---

## The perfect setup (sequenced funnel)

```
TikTok (two audiences, one root: yttre press överröstar inre signal)
   │
   ▼
/protokollet  — 19 kr tripwire   ← keep cheap; its job is to ID buyers
   │
   ▼
tack-page upsell  → app annual @ grundarpris   ← LEVER 1, the bridge (build first)
   │
   ▼
App free: check-in + status + 1 pass/nivå   ← keep; the viral moat & hook
   │
   ├── paywall fires at peak value (post-Vila / 3rd check-in), insight-anchored, annual-default  ← LEVER 4 + 3
   │
   ▼
Retention: PWA web-push in voice (+ optional utility email)   ← LEVER 2, the retention engine
   │
   ▼
Catalog: postpartum / illness / runner / voice-guide modules   ← LEVER 5, AOV ladder
   │
   ▼
Clinician + gifting distribution   ← LEVER 6, low-CAC growth
```

Pricing posture across all of it: **annual-first, founding price-lock, raise AOV
at the one moment the wallet is already open.**

---

## Anti-slop guardrails (what NOT to build)

Each of these spikes a vanity metric and raises churn because it betrays the
core. Do not ship them no matter how "standard" they look in other fitness apps:

- Streaks as punishment, "don't break the chain" pressure. (Your streak counts
  *check-ins, not training* — keep it that way; it's brand genius.)
- Badges, leaderboards, challenges, competition.
- Calorie / macro / weight tracking creep.
- Before/after bodies, transformation framing.
- Fake scarcity ("bara idag!"), countdown timers.
- Push spam. One gentle nudge ≠ daily nagging.

---

## Next concrete move

Build **Lever 1** (protokoll → annual bridge on the `tack` page). Reasons:
highest ROI, lowest effort, Stripe-only (no Supabase, no new auth), and it
monetizes the warmest leads you already paid TikTok attention to acquire. Then
Lever 2 (web-push) because nothing else compounds without retention.
