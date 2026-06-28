"use client";

import { Clock3, Dumbbell, Flame, LockKeyhole, Moon, TrendingUp } from "lucide-react";
import { STATUS_COPY, STATUS_VAR, type Status } from "@/lib/status";
import { veckaBars } from "@/lib/historik";
import type { CheckinPost, WorkoutSession } from "@/lib/types";
import Screen from "./ui/Screen";
import Card from "./ui/Card";
import Button from "./ui/Button";
import StatTile from "./ui/StatTile";
import BarChart from "./ui/BarChart";
import { DividedList, DividedRow } from "./ui/DividedList";

interface Props {
  history: CheckinPost[];
  sessions: WorkoutSession[];
  premium: boolean;
  streak: number;
  weeklyGoal: number;
  onWeeklyGoalChange: (value: number) => void;
  onCheckin: () => void;
  onUpgrade: () => void;
  onTillbaka: () => void;
}

const STATUSAR: Status[] = ["redo", "gransfall", "vila"];

function antal(history: CheckinPost[], status: Status) {
  return history.filter((post) => post.status === status).length;
}

function vanligasteStatus(history: CheckinPost[]): Status | null {
  if (!history.length) return null;
  return STATUSAR.reduce(
    (bast, status) => (antal(history, status) > antal(history, bast) ? status : bast),
    STATUSAR[0],
  );
}

function somnText(history: CheckinPost[]) {
  if (!history.length) return "Ingen sömndata än";
  const kortSomn = history.filter((post) => post.svar.somn < 5).length;
  if (kortSomn === 0) return "Oftast marginal";
  if (kortSomn === 1) return "En kort natt";
  return "Flera korta nätter";
}

function somnKvalitet(somn: number) {
  if (somn >= 7) return "god";
  if (somn >= 5) return "okej";
  return "kort";
}

export default function InsikterVy({
  history,
  sessions,
  premium,
  streak,
  weeklyGoal,
  onWeeklyGoalChange,
  onCheckin,
  onUpgrade,
  onTillbaka,
}: Props) {
  const locked = !premium;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const { bars, weekCount } = veckaBars(sessions);
  const reached = weekCount >= weeklyGoal;
  const vanligast = vanligasteStatus(history);
  const senaste = history.slice(-7).reverse();
  const synligaCheckins = locked ? senaste.slice(0, 3) : senaste;
  const harData = history.length > 0 || sessions.length > 0;

  return (
    <Screen onBack={onTillbaka}>
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-caption uppercase tracking-[0.08em] text-text-tertiary">
            Historik
          </p>
          <h1 className="mt-1 text-heading text-text-primary">Din utveckling</h1>
        </div>
        {locked && (
          <button
            onClick={onUpgrade}
            className="chip press min-h-11"
            style={{ color: "var(--text-primary)" }}
          >
            <LockKeyhole size={14} strokeWidth={1.6} />
            Lås upp
          </button>
        )}
      </header>

      {!harData ? (
        <Card padding="lg" className="mt-6 text-center">
          <TrendingUp
            size={28}
            strokeWidth={1.5}
            className="mx-auto text-accent"
          />
          <p className="mt-4 text-body text-text-primary">Inga insikter än</p>
          <p className="mt-2 text-bodysm text-text-secondary">
            Första mönstret börjar med dagens tre frågor.
          </p>
          <Button align="center" glow className="mt-5" onClick={onCheckin}>
            Starta check-in
          </Button>
        </Card>
      ) : (
        <>
          {/* Statistik-rad — check-in + pass på samma plats */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatTile
              icon={<Flame size={17} strokeWidth={1.6} />}
              label="Streak"
              value={String(streak || 0)}
              unit="dgr"
            />
            <StatTile
              icon={<Dumbbell size={17} strokeWidth={1.6} />}
              label="Pass"
              value={String(sessions.length)}
            />
            <StatTile
              icon={<Clock3 size={17} strokeWidth={1.6} />}
              label="Tid"
              value={String(Math.round(totalMinutes / 60))}
              unit="h"
            />
          </div>

          {/* Veckans aktivitet — pass per dag + veckomål */}
          <Card padding="md" className="mt-3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-subheading text-text-primary">
                Veckans aktivitet
              </h2>
              <span
                className="chip"
                style={{
                  color: reached ? "var(--accent)" : "var(--text-secondary)",
                  background: reached ? "var(--accent-soft)" : undefined,
                }}
              >
                {reached ? "Mål klart" : `${weekCount}/${weeklyGoal}`}
              </span>
            </div>
            <BarChart bars={bars} />

            <p className="mt-6 text-caption uppercase tracking-[0.08em] text-text-tertiary">
              Veckomål
            </p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((goal) => {
                const active = weeklyGoal === goal;
                return (
                  <button
                    key={goal}
                    onClick={() => onWeeklyGoalChange(goal)}
                    className="press tile min-h-12 text-bodysm"
                    style={{
                      color: active ? "var(--accent)" : "var(--text-primary)",
                      background: active ? "var(--accent-soft)" : undefined,
                    }}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Mönster — check-in-insikter */}
          <Card padding="md" className="mt-3">
            <h2 className="text-subheading text-text-primary">Mönster</h2>
            <DividedList className="mt-2">
              <DividedRow className="justify-between">
                <span className="text-bodysm text-text-secondary">
                  Vanligast
                </span>
                <span
                  className="text-bodysm font-medium"
                  style={{
                    color: vanligast
                      ? STATUS_VAR[vanligast]
                      : "var(--text-tertiary)",
                  }}
                >
                  {vanligast ? STATUS_COPY[vanligast].titel : "Väntar"}
                </span>
              </DividedRow>
              <DividedRow className="justify-between">
                <span className="flex items-center gap-2 text-bodysm text-text-secondary">
                  <Moon size={15} strokeWidth={1.6} />
                  Sömn
                </span>
                <span className="text-bodysm font-medium text-text-primary">
                  {somnText(history)}
                </span>
              </DividedRow>
            </DividedList>
          </Card>

          {/* Senaste incheckningar */}
          <Card padding="md" className="mt-3">
            <div className="flex items-center justify-between">
              <h2 className="text-subheading text-text-primary">
                Senaste incheckningar
              </h2>
              {locked && (
                <LockKeyhole
                  size={18}
                  strokeWidth={1.5}
                  className="text-text-tertiary"
                />
              )}
            </div>

            {history.length === 0 ? (
              <p className="mt-4 text-bodysm text-text-secondary">
                Inga incheckningar än — börja med dagens check-in.
              </p>
            ) : (
              <DividedList className="mt-2">
                {synligaCheckins.map((post) => (
                  <DividedRow key={post.date} className="justify-between">
                    <span className="text-bodysm text-text-secondary">
                      {post.date}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-caption text-text-tertiary">
                        Sömn {somnKvalitet(post.svar.somn)}
                      </span>
                      <span
                        className="text-bodysm font-medium"
                        style={{ color: STATUS_VAR[post.status] }}
                      >
                        {STATUS_COPY[post.status].titel}
                      </span>
                    </span>
                  </DividedRow>
                ))}
              </DividedList>
            )}

            {locked && history.length > 0 && (
              <div className="tile mt-4 p-4">
                <p className="text-bodysm text-text-primary">
                  Premium visar hela historiken och kopplar sömn, trötthet och
                  status.
                </p>
                <Button variant="secondary" className="mt-4" onClick={onUpgrade}>
                  Lås upp insikter
                  <LockKeyhole size={18} strokeWidth={1.5} />
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </Screen>
  );
}
