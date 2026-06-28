import type { Status } from "./status";
import type { EquipmentType, IntensityLevel } from "./types";

// ---------------------------------------------------------------------------
// Passbank — hemma/rum är default, inte tillägg. Tyst-vänligt, 4 kvm,
// minimal utrustning. Innehåll oförändrat från prototypen.
// Gratis: index 0 per nivå. Resten kräver premium.
// ---------------------------------------------------------------------------

export interface Pass {
  id: string;
  namn: string;
  tid: string;
  niva: string;
  fokus: string;
  utrustning: string;
  ljud: string;
  beskrivning: string;
  ovningar: string[];
  equipmentRequired: EquipmentType[];
  premium?: boolean;
}

export function getWorkoutDuration(level: IntensityLevel): number {
  if (level === "calm") return 15;
  if (level === "focused") return 35;
  return 25;
}

export function getIntensityLabel(level: IntensityLevel): string {
  if (level === "calm") return "Lugn";
  if (level === "focused") return "Fokus";
  return "Balans";
}

export function getAdjustedExercises(pass: Pass, level: IntensityLevel): string[] {
  if (level === "calm") return pass.ovningar.slice(0, Math.max(3, pass.ovningar.length - 2));
  if (level === "focused") return [...pass.ovningar, "Extra lugnt varv om kroppen fortfarande känns bra."];
  return pass.ovningar;
}

export function equipmentMatches(pass: Pass, selected: EquipmentType[]): boolean {
  if (pass.equipmentRequired.includes("none")) return true;
  return pass.equipmentRequired.every((item) => selected.includes(item));
}

export const PASSBANK: Record<Status, Pass[]> = {
  redo: [
    {
      id: "r1",
      namn: "Helkropp, tyst golv",
      tid: "18 min",
      niva: "Full nivå",
      fokus: "Styrka",
      utrustning: "Kroppsvikt",
      ljud: "Tyst",
      beskrivning: "Ett helt pass utan hopp, spring eller gymyta.",
      ovningar: [
        "Knäböj, 12 reps",
        "Armhävningar, 8-10 reps",
        "Bakåtutfall, 8 reps per sida",
        "Planka, 35 sek",
        "Glute bridge, 15 reps",
        "Vila 60 sek. Kör 3 varv.",
      ],
      equipmentRequired: ["none"],
    },
    {
      id: "r2",
      namn: "Överkropp, fokus",
      tid: "15 min",
      niva: "Full nivå",
      fokus: "Överkropp",
      utrustning: "Stol",
      ljud: "Tyst",
      premium: true,
      beskrivning: "Stabilt, privat och lätt att göra bredvid sängen.",
      ovningar: [
        "Armhävningar, 10 reps",
        "Dips mot stol, 8 reps",
        "Superman-hold, 30 sek",
        "Pike push-up, 6 reps",
        "Sidoplanka, 25 sek per sida",
        "Vila 45 sek. Kör 3 varv.",
      ],
      equipmentRequired: ["none"],
    },
    {
      id: "r3",
      namn: "Ben och bål",
      tid: "20 min",
      niva: "Full nivå",
      fokus: "Ben",
      utrustning: "Kroppsvikt",
      ljud: "Tyst",
      premium: true,
      beskrivning: "Bygger trygg styrka utan att kännas som ett gympass.",
      ovningar: [
        "Tempo-knäböj, 10 reps",
        "Split squat, 8 reps per sida",
        "Dead bug, 10 reps per sida",
        "Vadpress, 18 reps",
        "Hollow hold, 20 sek",
        "Vila 60 sek. Kör 3 varv.",
      ],
      equipmentRequired: ["none"],
    },
    {
      id: "r4",
      namn: "Kort marginalpass",
      tid: "11 min",
      niva: "Full nivå",
      fokus: "Helkropp",
      utrustning: "Ingen",
      ljud: "Mycket tyst",
      premium: true,
      beskrivning: "När du är redo men dagen inte har plats för mer.",
      ovningar: [
        "Knäböj, 12 reps",
        "Armhävning mot bord, 10 reps",
        "Höftlyft, 15 reps",
        "Mountain climber långsam, 20 reps",
        "Vila 45 sek. Kör 2 varv.",
      ],
      equipmentRequired: ["none"],
    },
  ],
  gransfall: [
    {
      id: "g1",
      namn: "Lätt rörelse",
      tid: "12 min",
      niva: "Lätt nivå",
      fokus: "Rörlighet",
      utrustning: "Ingen",
      ljud: "Tyst",
      beskrivning: "Lägre intensitet. Du väljer tempo och kan stanna när du vill.",
      ovningar: [
        "Katt-ko, 10 reps",
        "Världens bästa stretch, 5 reps per sida",
        "Höftöppnare, 60 sek per sida",
        "Lugn gång på stället 3 min",
        "Andning 2 min",
      ],
      equipmentRequired: ["none"],
    },
    {
      id: "g2",
      namn: "Mobilitet, helkropp",
      tid: "14 min",
      niva: "Lätt nivå",
      fokus: "Mobilitet",
      utrustning: "Ingen",
      ljud: "Tyst",
      premium: true,
      beskrivning: "Mjuk rörelse genom hela kroppen. Inget krav på tempo.",
      ovningar: [
        "Axelcirklar 60 sek",
        "Bröstryggsrotation, 8 reps per sida",
        "Djup knäböj-hold 40 sek",
        "Höftfällning, 10 reps",
        "Andning 2 min",
      ],
      equipmentRequired: ["none"],
    },
    {
      id: "g3",
      namn: "Valfri styrka",
      tid: "9 min",
      niva: "Valfri nivå",
      fokus: "Lätt styrka",
      utrustning: "Vägg",
      ljud: "Tyst",
      premium: true,
      beskrivning: "Lite struktur utan att kroppen behöver prestera.",
      ovningar: [
        "Väggarmhävning, 10 reps",
        "Sitt till stå, 8 reps",
        "Sidosteg långsamt, 8 reps per sida",
        "Dead bug, 8 reps per sida",
        "Vila fritt. Kör 1-2 varv.",
      ],
      equipmentRequired: ["none"],
    },
    {
      id: "g4",
      namn: "Nervsystem ner",
      tid: "7 min",
      niva: "Valfri nivå",
      fokus: "Lugn",
      utrustning: "Ingen",
      ljud: "Nästan ljudlös",
      premium: true,
      beskrivning: "För dagar där det mest hjälper att sänka tempot.",
      ovningar: [
        "Boxandning, 2 min",
        "Nackrullning, 60 sek",
        "Barnets position, 90 sek",
        "Liggande rotation, 6 reps per sida",
        "Lång utandning, 90 sek",
      ],
      equipmentRequired: ["none"],
    },
  ],
  vila: [
    {
      id: "v1",
      namn: "Återhämtning",
      tid: "10 min",
      niva: "Ingen träning",
      fokus: "Nedvarvning",
      utrustning: "Ingen",
      ljud: "Tyst",
      beskrivning: "Ingen träning idag. Detta är hela planen.",
      ovningar: [
        "Liggande andning 4 min",
        "Statisk stretch, ben 3 min",
        "Statisk stretch, rygg 3 min",
      ],
      equipmentRequired: ["mat"],
    },
    {
      id: "v2",
      namn: "Nedvarvning, kväll",
      tid: "8 min",
      niva: "Ingen träning",
      fokus: "Sömn",
      utrustning: "Vägg",
      ljud: "Tyst",
      premium: true,
      beskrivning: "Lugnt innan sömn. Ljuset nere, tempot lågt.",
      ovningar: [
        "Liggande benvila mot vägg 4 min",
        "Mjuk ryggrotation, 6 reps per sida",
        "Förlängd utandning 2 min",
      ],
      equipmentRequired: ["mat"],
    },
    {
      id: "v3",
      namn: "Morgon utan press",
      tid: "6 min",
      niva: "Ingen träning",
      fokus: "Starta lugnt",
      utrustning: "Ingen",
      ljud: "Tyst",
      premium: true,
      beskrivning: "En mjuk start när kroppen inte vill bli jagad.",
      ovningar: [
        "Sittande andning, 90 sek",
        "Fotledscirklar, 45 sek per sida",
        "Axlar upp och ner, 60 sek",
        "Framåtfällning sittande, 2 min",
      ],
      equipmentRequired: ["none"],
    },
    {
      id: "v4",
      namn: "Total vila",
      tid: "3 min",
      niva: "Ingen träning",
      fokus: "Avsluta",
      utrustning: "Ingen",
      ljud: "Tyst",
      premium: true,
      beskrivning: "När rätt val är att göra nästan ingenting.",
      ovningar: [
        "Lägg telefonen åt sidan",
        "Tre långsamma andetag",
        "Bestäm att dagens träning är klar",
      ],
      equipmentRequired: ["none"],
    },
  ],
};
