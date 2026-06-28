"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BarChart3, CheckCircle2, Dumbbell, Home, Wind } from "lucide-react";
import CheckIn from "@/components/CheckIn";
import {
  haptic,
  IntensitySelectionView,
  RecoveryView,
} from "@/components/FeatureViews";
import InsikterVy from "@/components/InsikterVy";
import PassVy from "@/components/PassVy";
import RevenueBanners from "@/components/RevenueBanners";
import StartVy from "@/components/StartVy";
import StatusVy from "@/components/StatusVy";
import UppgraderaModal from "@/components/UppgraderaModal";
import {
  beraknaStatusResultat,
  type CheckinSvar,
  type Status,
  type StatusResultat,
} from "@/lib/status";
import type { AppState, CheckinPost, Plan } from "@/lib/types";
import type { EquipmentType, IntensityLevel, WorkoutSession } from "@/lib/types";
import { loadState, saveCheckin, startCheckout } from "@/lib/data";
import { logEvent } from "@/lib/analytics";
import { shouldShowPaywall, markPaywallShown } from "@/lib/paywall";
import { lokalDatum } from "@/lib/streak";
import { FOUNDING } from "@/lib/pricing";

type Skede =
  | "hem"
  | "checkin"
  | "status"
  | "intensity"
  | "pass"
  | "recovery"
  | "insikter";

interface UpgradeOffer {
  plan: Plan;
  founding: boolean;
}

function senaste(history: CheckinPost[]) {
  return history.length ? history[history.length - 1] : null;
}

function dagensResultat(history: CheckinPost[]) {
  const post = senaste(history);
  if (!post || post.date !== lokalDatum()) return null;
  return beraknaStatusResultat(post.svar);
}

export default function HomePage() {
  const [skede, setSkede] = useState<Skede>("hem");
  const [resultat, setResultat] = useState<StatusResultat | null>(null);
  const [history, setHistory] = useState<CheckinPost[]>([]);
  const [premium, setPremium] = useState(false);
  const [streak, setStreak] = useState(0);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [uppgraderaOffer, setUppgraderaOffer] = useState<UpgradeOffer | null>(null);
  const [selectedIntensity, setSelectedIntensity] =
    useState<IntensityLevel>("balanced");
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>([
    "none",
  ]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    let avbruten = false;
    (async () => {
      const state = await loadState();
      if (avbruten) return;
      setAppState(state);
      setPremium(state.premium);
      setStreak(state.streak);
      setHistory(state.history);
      setResultat(dagensResultat(state.history));
      setSelectedIntensity(
        (window.localStorage.getItem("aterstall.intensity") as IntensityLevel) ??
          "balanced",
      );
      setSelectedEquipment(
        JSON.parse(
          window.localStorage.getItem("aterstall.equipment") ?? "[\"none\"]",
        ) as EquipmentType[],
      );
      setAudioEnabled(window.localStorage.getItem("aterstall.audio") === "1");
      setWeeklyGoal(Number(window.localStorage.getItem("aterstall.goal") ?? 3));
      setSessions(
        JSON.parse(
          window.localStorage.getItem("aterstall.sessions") ?? "[]",
        ) as WorkoutSession[],
      );

      const params = new URLSearchParams(window.location.search);
      if (params.get("premium") === "klar") {
        window.history.replaceState({}, "", window.location.pathname);
        setSkede("hem");
        return;
      }

      // Bryggan: protokoll-köpare returnerar med ?offer=founding eller ?offer=year
      const offer = params.get("offer");
      if (offer && !state.premium) {
        window.history.replaceState({}, "", window.location.pathname);
        const isFoundingOffer = offer === "founding" && FOUNDING.enabled;
        oppnaUppgradera({ plan: "year", founding: isFoundingOffer });
        return;
      }

      // Paywall-trigger: tredje incheckning (visas om cooldown inte är aktiv)
      if (
        !state.premium &&
        shouldShowPaywall(state.checkinCount, state.history, false, "third_checkin")
      ) {
        markPaywallShown("third_checkin");
        void logEvent("paywall_shown", { source: "third_checkin" });
        oppnaUppgradera({ plan: "year", founding: false });
        return;
      }

      // Paywall-trigger: första Vila-status
      if (
        !state.premium &&
        shouldShowPaywall(state.checkinCount, state.history, false, "first_vila")
      ) {
        markPaywallShown("first_vila");
        void logEvent("paywall_shown", { source: "first_vila" });
        oppnaUppgradera({ plan: "year", founding: false });
      }
    })();
    return () => {
      avbruten = true;
    };
  }, []);

  const aktivtResultat = useMemo(() => {
    return resultat ?? dagensResultat(history);
  }, [history, resultat]);

  const aktivStatus: Status = aktivtResultat?.status ?? "redo";

  function oppnaUppgradera(offer: UpgradeOffer = { plan: "year", founding: false }) {
    setUppgraderaOffer(offer);
  }

  function stangUppgradera() {
    void logEvent("paywall_dismissed");
    setUppgraderaOffer(null);
  }

  async function valjPlan(plan: Plan, founding = false) {
    await startCheckout(plan, founding);
    const state = await loadState();
    setAppState(state);
    setPremium(state.premium);
    setHistory(state.history);
    setStreak(state.streak);
    setUppgraderaOffer(null);
  }

  async function sparaCheckin(nyttResultat: StatusResultat, svar: CheckinSvar) {
    setResultat(nyttResultat);
    setSkede("status");
    const state = await saveCheckin(nyttResultat.status, svar);
    setAppState(state);
    setPremium(state.premium);
    setStreak(state.streak);
    setHistory(state.history);
  }

  function updateIntensity(value: IntensityLevel) {
    setSelectedIntensity(value);
    window.localStorage.setItem("aterstall.intensity", value);
  }

  function updateEquipment(value: EquipmentType[]) {
    setSelectedEquipment(value);
    window.localStorage.setItem("aterstall.equipment", JSON.stringify(value));
  }

  function updateAudioEnabled(value: boolean) {
    setAudioEnabled(value);
    window.localStorage.setItem("aterstall.audio", value ? "1" : "0");
  }

  function updateWeeklyGoal(value: number) {
    setWeeklyGoal(value);
    window.localStorage.setItem("aterstall.goal", String(value));
  }

  function completeWorkout(duration: number) {
    const next = [...sessions, { date: new Date().toISOString(), duration }];
    setSessions(next);
    window.localStorage.setItem("aterstall.sessions", JSON.stringify(next));
    haptic();
    setSkede("recovery");
  }

  function oppnaPaywall(source: "locked_pass" | "manual" = "manual") {
    markPaywallShown(source);
    void logEvent("paywall_shown", { source });
    oppnaUppgradera({ plan: "year", founding: false });
  }

  return (
    <main className="app-shell relative flex min-h-dvh flex-col">
      {skede !== "checkin" && (
        <nav className="mx-auto hidden w-full max-w-md px-4 pt-5 lg:block">
          <div className="flex items-center justify-around gap-1 rounded-full border border-separator bg-bg-raised p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <NavKnapp
              aktiv={skede === "hem"}
              label="Idag"
              icon={<Home size={18} strokeWidth={1.5} />}
              onClick={() => setSkede("hem")}
            />
            <NavKnapp
              aktiv={skede === "status"}
              label="Check-in"
              icon={<CheckCircle2 size={18} strokeWidth={1.5} />}
              onClick={() => setSkede("checkin")}
            />
            <NavKnapp
              aktiv={skede === "pass" || skede === "intensity"}
              label="Pass"
              icon={<Dumbbell size={18} strokeWidth={1.5} />}
              onClick={() => setSkede("intensity")}
            />
            <NavKnapp
              aktiv={skede === "recovery"}
              label="Återställ"
              icon={<Wind size={18} strokeWidth={1.5} />}
              onClick={() => setSkede("recovery")}
            />
            <NavKnapp
              aktiv={skede === "insikter"}
              label="Historik"
              icon={<BarChart3 size={18} strokeWidth={1.5} />}
              onClick={() => setSkede("insikter")}
            />
          </div>
        </nav>
      )}

      <div
        key={skede}
        className={`flex-1 ${skede === "hem" || skede === "status" ? "animate-home" : "animate-slide-right"}`}
      >
        {skede === "hem" && (
          <StartVy
            history={history}
            premium={premium}
            streak={streak}
            onCheckin={() => setSkede("checkin")}
            onPass={() => setSkede("intensity")}
            onInsikter={() => setSkede("insikter")}
            onPlan={(plan) => valjPlan(plan)}
          />
        )}

        {skede === "checkin" && (
          <CheckIn onKlar={sparaCheckin} onAvbryt={() => setSkede("hem")} />
        )}

        {skede === "status" && aktivtResultat && (
          <StatusVy
            resultat={aktivtResultat}
            streak={streak}
            onVisaPass={() => setSkede("intensity")}
            onInsikter={() => setSkede("insikter")}
            onNyCheckin={() => setSkede("checkin")}
          />
        )}

        {skede === "status" && !aktivtResultat && (
          <StartVy
            history={history}
            premium={premium}
            streak={streak}
            onCheckin={() => setSkede("checkin")}
            onPass={() => setSkede("intensity")}
            onInsikter={() => setSkede("insikter")}
            onPlan={(plan) => valjPlan(plan)}
          />
        )}

        {skede === "intensity" && (
          <IntensitySelectionView
            value={selectedIntensity}
            onChange={updateIntensity}
            onContinue={() => setSkede("pass")}
          />
        )}

        {skede === "pass" && (
          <PassVy
            status={aktivStatus}
            premium={premium}
            selectedIntensity={selectedIntensity}
            selectedEquipment={selectedEquipment}
            audioEnabled={audioEnabled}
            onAudioEnabledChange={updateAudioEnabled}
            onEquipmentChange={updateEquipment}
            onComplete={completeWorkout}
            onTillbaka={() => setSkede(aktivtResultat ? "status" : "hem")}
            onLast={() => oppnaPaywall("locked_pass")}
          />
        )}

        {skede === "recovery" && <RecoveryView onDone={() => setSkede("hem")} />}

        {skede === "insikter" && (
          <InsikterVy
            history={history}
            sessions={sessions}
            premium={premium}
            streak={streak}
            weeklyGoal={weeklyGoal}
            onWeeklyGoalChange={updateWeeklyGoal}
            onCheckin={() => setSkede("checkin")}
            onUpgrade={() => oppnaPaywall("manual")}
            onTillbaka={() => setSkede("hem")}
          />
        )}
      </div>

      {/* Dunning/win-back-banners — visas under nav (högt i stacken) */}
      {appState && skede === "hem" && (
        <div className="mx-auto w-full max-w-md px-5 pb-2">
          <RevenueBanners state={appState} />
        </div>
      )}

      {skede !== "checkin" && (
        <nav className="fixed inset-x-3 bottom-3 z-30 rounded-full border border-separator bg-bg-raised/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur md:left-1/2 md:right-auto md:mb-2 md:w-[440px] md:-translate-x-1/2 lg:hidden">
          <div className="flex items-center justify-around gap-1">
            <NavKnapp
              aktiv={skede === "hem"}
              label="Idag"
              icon={<Home size={18} strokeWidth={1.5} />}
              onClick={() => setSkede("hem")}
            />
            <NavKnapp
              aktiv={skede === "status"}
              label="Check-in"
              icon={<CheckCircle2 size={18} strokeWidth={1.5} />}
              onClick={() => setSkede("checkin")}
            />
            <NavKnapp
              aktiv={skede === "pass" || skede === "intensity"}
              label="Pass"
              icon={<Dumbbell size={18} strokeWidth={1.5} />}
              onClick={() => setSkede("intensity")}
            />
            <NavKnapp
              aktiv={skede === "recovery"}
              label="Återställ"
              icon={<Wind size={18} strokeWidth={1.5} />}
              onClick={() => setSkede("recovery")}
            />
            <NavKnapp
              aktiv={skede === "insikter"}
              label="Historik"
              icon={<BarChart3 size={18} strokeWidth={1.5} />}
              onClick={() => setSkede("insikter")}
            />
          </div>
        </nav>
      )}

      {uppgraderaOffer && (
        <UppgraderaModal
          defaultPlan={uppgraderaOffer.plan}
          defaultFounding={uppgraderaOffer.founding}
          onStang={stangUppgradera}
          onKop={(plan, founding) => valjPlan(plan, founding)}
        />
      )}
    </main>
  );
}

function NavKnapp({
  aktiv,
  label,
  icon,
  onClick,
}: {
  aktiv: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="press flex min-h-12 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-caption font-medium leading-none"
      style={{
        color: aktiv ? "var(--bg)" : "var(--text-tertiary)",
        backgroundColor: aktiv ? "var(--accent)" : "transparent",
        boxShadow: aktiv ? "0 0 16px var(--accent-glow)" : "none",
        transition:
          "background-color 0.28s var(--ease-spring), color 0.2s ease, box-shadow 0.28s ease",
      }}
    >
      {icon}
      <span
        style={{
          maxWidth: aktiv ? "72px" : "0px",
          overflow: "hidden",
          opacity: aktiv ? 1 : 0,
          whiteSpace: "nowrap",
          transition:
            "max-width 0.3s var(--ease-spring), opacity 0.2s ease",
        }}
      >
        {label}
      </span>
    </button>
  );
}
