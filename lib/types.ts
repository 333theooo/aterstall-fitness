import type { CheckinSvar, Status } from "./status";

export type IntensityLevel = "calm" | "balanced" | "focused";

export type EquipmentType =
  | "none"
  | "mat"
  | "dumbbells"
  | "band"
  | "step";

export interface WorkoutSession {
  date: string;
  duration: number;
}

// En incheckning som den lagras (status + råa svar för mönsterinsikter).
export interface CheckinPost {
  date: string; // YYYY-MM-DD (lokal)
  status: Status;
  svar: CheckinSvar;
}

// Samlad app-state som UI:t läser.
export interface AppState {
  history: CheckinPost[];
  streak: number;
  premium: boolean;
  checkinCount: number;
  // Prenumerationsdetaljer (null i localStorage-läge)
  lastPaymentStatus: string | null;
  cancelAtPeriodEnd: boolean;
  subscriptionStatus: string | null;
  hasHadSubscription: boolean; // true = stripe_customer_id finns men premium=false → win-back
}

export type Plan = "month" | "year";
