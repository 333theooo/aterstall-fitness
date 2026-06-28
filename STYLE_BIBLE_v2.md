# STYLE_BIBLE.md — Återställ (v2)

Detta dokument ERSÄTTER tidigare STYLE_BIBLE helt. Referenspunkt: mörk
fitness-dashboard-stil (lime/neon-accent på kolmörk bas, datavisualisering
synlig, fotobaserade kort). Om kod och detta dokument skiljer sig åt:
dokumentet vinner.

---

## 1. Grid & spacing

Samma grundprincip som tidigare — multiplar av 4px.
```
4   8   12  16  20  24  32  40  48  64  80
```
- Skärmmarginal: 20px
- Mellanrum mellan kort i en grid: 12px
- Mellanrum mellan sektioner: 24–32px

---

## 2. Typografi

**Fontstack:** -apple-system, "SF Pro Display", "SF Pro Text", system-ui, sans-serif

| Roll | Storlek | Vikt | Användning |
|---|---|---|---|
| Hero-siffra/status | 32–40px | 600 (semibold) | "74%", "Redo", stora KPI-tal |
| Rubrik | 22px | 600 | Skärmtitlar ("Hi, Confidency"-ekvivalent) |
| Kortrubrik | 15px | 500 | Kortets namn ovanför värdet |
| Body | 15px | 400 | Brödtext |
| Caption/label | 12–13px | 400–500 | Smalltext under siffror, taggar |

Skillnad mot v1: hero-text får nu vara semibold, inte bara regular — det
matchar referensbildens vikt på "74%" och rubriker.

---

## 3. Färg

**Bas:**
```
--bg:          #14160F   (varmare kolmörk, grön-svart ton)
--bg-card:     #1C1F16   (kort-bakgrund, något lyft)
--bg-card-2:   #20231A   (sekundär kort-yta)
--text-primary:   #F5F5F0
--text-secondary: #A8AB9E
--text-tertiary:  #6E7165
--separator:      #2A2D22
```

**Accentfärg — lime/neon-grön, huvudaccent för status, progress, highlights:**
```
--accent:        #C6F135   (primär lime)
--accent-dim:    #8FB024   (dämpad variant, för text på ljus yta)
--accent-glow:   rgba(198, 241, 53, 0.35)   (för glow-effekter)
```

**Statusfärger (Redo/Gränsfall/Vila) — mappas till samma accentfamilj nu:**
```
--redo:      #C6F135   (lime, full energi)
--gransfall: #E8C547   (varm gul, mellanläge)
--vila:      #5B8A7A   (dämpad teal-grön, lugn)
```

**Tillåtet nu (omvänt mot v1):**
- Glow-effekter runt aktiva element: `box-shadow: 0 0 24px var(--accent-glow)`
- Subtila gradients på kort-bakgrunder för djup, t.ex.
  `linear-gradient(135deg, #1C1F16, #14160F)`
- Progress-ringar, stapeldiagram, linjediagram som permanenta UI-element

---

## 4. Layout — dashboard-struktur

Till skillnad från v1 ("en skärm, en sanning") använder vi nu en
**hem-skärm med flera kort samtidigt**, i linje med referensbilden:

- **Hero-kort** överst: dagens status/mål som ett stort kort med
  progress-bar eller ring, t.ex. "Du är 74% till ditt mål"-ekvivalent
  blir "Du är Redo idag" + en visuell indikator.
- **Statistik-rad**: 2 mindre kort sida vid sida (t.ex. Aktiva kalorier
  / Total distans-ekvivalent — för Återställ blir det typ "Sömn" /
  "Återhämtning" som siffror).
- **Diagram-kort**: stapeldiagram eller linjediagram över senaste
  dagarnas check-in-historik, med en highlighted/aktiv stapel i accent-
  färg (matchar referensbildens "3,789 steg"-stapeldiagram med en
  ljusare aktiv stapel).
- **Bottom navigation**: fast navigationsfält längst ner med 3–4 ikoner
  (Hem, Analys, Pass, Profil), aktiv flik markerad med accentfärg +
  rundad bakgrund (pill), matchar referensbildens "Home"-pill.

---

## 5. Komponenter

### Kort
- `--bg-card` bakgrund, 16–20px border-radius (rundare än v1:s 12px —
  matchar referensbildens mjukare kort).
- Subtil gradient eller `box-shadow: 0 4px 20px rgba(0,0,0,0.4)` för djup
  — skuggor är nu TILLÅTNA, till skillnad från v1.

### Progress-indikatorer
- Linjär progress-bar: bakgrund `--bg-card-2`, fyllning `--accent`, med
  glow (`box-shadow: 0 0 12px var(--accent-glow)`) på fyllningen.
- Progress-ring: stroke i `--accent`, bakgrund-ring i `--separator`,
  rundade ändar (`stroke-linecap: round`).

### Diagram (stapel/linje)
- Stapeldiagram: smala rundade staplar, `--bg-card-2` för inaktiva,
  `--accent` för aktiv/highlighted stapel, ofta med en liten "tooltip"-
  bubbla ovanför den aktiva stapeln som visar exakt värde.
- Linjediagram: tunn linje i `--accent`, fylld area under linjen med
  gradient ner till transparent (`linear-gradient(180deg, var(--accent-glow), transparent)`).

### Bottom navigation
- Fast position längst ner, `--bg-card` bakgrund, `border-radius: 24px`
  som en "pill-bar" med marginal från skärmkanten (inte edge-to-edge).
- Aktiv flik: ikon + label i en lime-fylld pill-bakgrund
  (`background: var(--accent)`, text i mörk färg för kontrast).

### Ikoner
- Outline-ikoner, 20–24px, `--text-secondary` som default, `--accent`
  eller mörk text-på-accent när aktiv/vald.

### Knappar
- Primär CTA: fylld `--accent`-bakgrund, mörk text (`--bg`) för kontrast,
  `border-radius: 14px`, kan ha lätt glow.
- Sekundär: `--bg-card` bakgrund, `--text-primary` text.

---

## 6. Rörelse

Samma grundprincip som v1 — spring-baserat, inte linear:
```css
transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
```
Knapptryck: `scale(0.97)`. Kort kan nu även ha en lätt "lyft"-hover/press
(`translateY(-2px)` + ökad skugga) eftersom skuggor är tillåtna i v2.

---

## 7. Vad som INTE längre gäller (v1-regler som nu är upphävda)

- ❌ "Statusfärg ska aldrig fylla en hel yta" — upphävt, lime-fyllda kort/
  pills/progress-bars är nu kärnan i designen.
- ❌ "Inga gradients" — upphävt, subtila gradients för djup är tillåtna.
- ❌ "Inga box-shadows" — upphävt, skuggor används för kort-elevation.
- ❌ "Ingen datavisualisering som dekoration" — upphävt, diagram är nu
  permanenta, centrala UI-element.
- ❌ "En skärm, en sanning" — upphävt för hem/analys-vyer, som nu är
  dashboard-strukturerade med flera kort. Check-in-flödet (frågorna)
  kan fortfarande vara enkel-fokus, men resultat-/hem-vyn är dashboard.

## 8. Vad som FORTFARANDE gäller (oförändrat från v1)

- ✅ Tonalitetsreglerna (Vila är aldrig skuldtyngd, entusiasm är konsekvens
  av status, inte påtryckning) — detta är textinnehåll, inte visuellt,
  och ändras inte av designbytet.
- ✅ Streak = incheckning, inte träningsvolym.
- ✅ Mobil-first, safe-area-insets, tumzon-placering av primära CTA:er.
- ✅ 4px-spacing-grid.
- ✅ System-fontstacken (inga custom display-fonter).