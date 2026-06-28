// ---------------------------------------------------------------------------
// Statusmotor — transparent poängmodell. Ingen falsk decimal-precision.
// Logiken härstammar från prototypen (aterstall-app.jsx), rensad från
// decimalvärden och buggig sömn-mappning. Samma trösklar.
// ---------------------------------------------------------------------------

export type Status = "redo" | "gransfall" | "vila";
export type Belastning = "tung" | "medel" | "latt";

export interface CheckinSvar {
  somn: number; // ungefärligt antal timmar
  trotthet: number; // 1 (pigg) – 4 (slut)
  belastning: Belastning;
}

export interface StatusDel {
  id: "somn" | "trotthet" | "belastning";
  label: string;
  poang: number;
  text: string;
}

export interface StatusResultat {
  status: Status;
  poang: number;
  delar: StatusDel[];
}

function somnDel(somn: number): StatusDel {
  if (somn >= 7) {
    return {
      id: "somn",
      label: "Sömn",
      poang: 2,
      text: "Sömnen ger kroppen marginal idag.",
    };
  }

  if (somn >= 5) {
    return {
      id: "somn",
      label: "Sömn",
      poang: 0,
      text: "Sömnen var okej, men ger ingen extra marginal.",
    };
  }

  return {
    id: "somn",
    label: "Sömn",
    poang: -2,
    text: "Lite sömn drar ner belastningen kroppen bör ta.",
  };
}

function trotthetDel(trotthet: number): StatusDel {
  if (trotthet <= 2) {
    return {
      id: "trotthet",
      label: "Trötthet",
      poang: 2,
      text: "Kroppen känns tillräckligt lätt för rörelse.",
    };
  }

  if (trotthet === 3) {
    return {
      id: "trotthet",
      label: "Trötthet",
      poang: 0,
      text: "Lite tungt. Tempot behöver få vara valfritt.",
    };
  }

  return {
    id: "trotthet",
    label: "Trötthet",
    poang: -2,
    text: "Tung trötthet är en tydlig signal att backa.",
  };
}

function belastningDel(belastning: Belastning): StatusDel {
  if (belastning === "tung") {
    return {
      id: "belastning",
      label: "Senaste passet",
      poang: -1,
      text: "Ett tungt pass nyligen sänker rekommenderad nivå.",
    };
  }

  if (belastning === "latt") {
    return {
      id: "belastning",
      label: "Senaste passet",
      poang: 1,
      text: "Lätt eller inget pass lämnar mer utrymme idag.",
    };
  }

  return {
    id: "belastning",
    label: "Senaste passet",
    poang: 0,
    text: "Medelbelastning lämnar statusen åt sömn och trötthet.",
  };
}

export function beraknaStatusResultat(svar: CheckinSvar): StatusResultat {
  const delar = [
    somnDel(svar.somn),
    trotthetDel(svar.trotthet),
    belastningDel(svar.belastning),
  ];
  const poang = delar.reduce((sum, del) => sum + del.poang, 0);

  return {
    status: poang >= 2 ? "redo" : poang <= -2 ? "vila" : "gransfall",
    poang,
    delar,
  };
}

export function beraknaStatus(svar: CheckinSvar): Status {
  return beraknaStatusResultat(svar).status;
}

export interface StatusCopy {
  titel: string;
  rad: string;
  riktning: string;
  passNiva: string;
}

// Ton (STYLE_BIBLE + brief): entusiasm är en konsekvens av statusen, aldrig
// ett försök att ändra den. Vila är bekräftande, aldrig skuldtyngd.
export const STATUS_COPY: Record<Status, StatusCopy> = {
  redo: {
    titel: "Redo",
    rad: "Kroppen har tillräcklig marginal för ett riktigt pass.",
    riktning: "Fullt pass, fortfarande tyst och hemma-vänligt.",
    passNiva: "Full nivå",
  },
  gransfall: {
    titel: "Gränsfall",
    rad: "Ingen toppdag, ingen dålig dag. Du väljer tempo.",
    riktning: "Lätt rörelse eller avstå. Båda räknas som att lyssna.",
    passNiva: "Lätt eller valfritt",
  },
  vila: {
    titel: "Vila",
    rad: "Idag är återhämtning rätt svar.",
    riktning: "Ingen träning. Bara nedvarvning om det känns skönt.",
    passNiva: "Ingen träning",
  },
};

// CSS-variabelnamn per status (färg bärs av token, inte hårdkodad här).
export const STATUS_VAR: Record<Status, string> = {
  redo: "var(--redo)",
  gransfall: "var(--gransfall)",
  vila: "var(--vila)",
};
