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
import WelcomeScreen from "@/components/auth/WelcomeScreen";
import AuthForm from "@/components/auth/AuthForm";
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
import { getSupabase, loadName, signOut, supabaseEnabled } from "@/lib/supabase/client";
import WelcomeAnimation from "@/components/WelcomeAnimation";

// Auth-lager: kontrollerar session innan appen visas.
// "laddar" = väntar på Supabase; "valkomst"/"login"/"signup" = auth-flöde.
// "välkommen" = inloggad, visar välkomstskärm med namn; "app" = redo.
type AuthLage = "laddar" | "valkomst" | "login" | "signup" | "välkommen" | "app";

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
  // Dev-läge utan Supabase startar direkt i "app"; annars väntar vi på session.
  const [authLage, setAuthLage] = useState<AuthLage>(() =>
    supabaseEnabled() ? "laddar" : "app",
  );
  const [skede, setSkede] = useState<Skede>("hem");
  const [resultat, setResultat] = useState<StatusResultat | null>(null);
  const [history, setHistory] = useState<CheckinPost[]>([]);
  const [premium, setPremium] = useState(false);
  const [streak, setStreak] = useState(0);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [uppgraderaOffer, setUppgraderaOffer] = useState<UpgradeOffer | null>(null);
  const [selectedIntensity, setSelectedIntensity] =
    useState<IntensityLevel>("balanced");
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>([
    "none",
  ]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  // ── Auth-gate: kontrollera session och lyssna på förändringar ──────────────
  useEffect(() => {
    if (!supabaseEnabled()) return; // dev-läge: state initierades redan som "app"
    const sb = getSupabase();
    if (!sb) return;

    // Kontrollera befintlig session (remembered login → visa välkomstsanimation)
    sb.auth.getSession().then(({ data: { session } }) => {
      setAuthLage(session ? "välkommen" : "valkomst");
    });

    // Lyssna på inloggning/utloggning — visa välkomst vid SIGNED_IN + INITIAL_SESSION
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setAuthLage("valkomst");
      } else if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setAuthLage(session ? "välkommen" : "valkomst");
      }
      // TOKEN_REFRESHED, USER_UPDATED etc: ignoreras för att inte återvisa välkomstskärmen
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Välkomstanimation: ladda namn, visa skärm, gå sedan till app ─────────
  useEffect(() => {
    if (authLage !== "välkommen") return;
    let cancelled = false;
    loadName().then((n) => {
      if (cancelled) return;
      setName(n);
      if (n) {
        setTimeout(() => { if (!cancelled) setAuthLage("app"); }, 2500);
      } else {
        setAuthLage("app");
      }
    });
    return () => { cancelled = true; };
  }, [authLage]);

  // ── App-data: laddas när auth är klar ───────────────────────────────────
  useEffect(() => {
    if (authLage !== "app") return;
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
  }, [authLage]);

  const aktivtResultat = useMemo(() => {
    return resultat ?? dagensResultat(history);
  }, [history, resultat]);

  // Latest today's check-in svar — used for personalizing StatusVy + StartVy CTA
  const dagensSvar = useMemo(() => {
    const idag = lokalDatum();
    const post = history.findLast((p) => p.date === idag);
    return post?.svar ?? null;
  }, [history]);

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

    // Pre-populate intensity + equipment from check-in answers so the user
    // doesn't have to re-answer when tapping "Visa pass"
    if (svar.tid && svar.tid !== "okant") {
      const intensity: IntensityLevel =
        svar.tid === "kort" ? "calm" : svar.tid === "lang" ? "focused" : "balanced";
      updateIntensity(intensity);
    }
    if (svar.plats && svar.plats !== "okant") {
      const equipment: EquipmentType[] =
        svar.plats === "gym" ? ["mat", "dumbbells"] : ["none"];
      updateEquipment(equipment);
    }

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

  // ── Auth-lager: visa rätt skärm baserat på auth-tillstånd ─────────────────
  if (authLage === "laddar") return <LaddaSkarm />;
  if (authLage === "välkommen" && name)
    return <WelcomeAnimation name={name} onDone={() => setAuthLage("app")} />;
  if (authLage === "välkommen") return <LaddaSkarm />;
  if (authLage === "valkomst")
    return (
      <WelcomeScreen
        onSkapaKonto={() => setAuthLage("signup")}
        onLoggaIn={() => setAuthLage("login")}
      />
    );
  if (authLage === "login" || authLage === "signup")
    return (
      <AuthForm
        initialMode={authLage}
        onTillbaka={() => setAuthLage("valkomst")}
      />
    );

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
            name={name}
            onCheckin={() => setSkede("checkin")}
            onPass={() => setSkede("intensity")}
            onInsikter={() => setSkede("insikter")}
            onPlan={(plan) => oppnaUppgradera({ plan, founding: false })}
          />
        )}

        {skede === "checkin" && (
          <CheckIn onKlar={sparaCheckin} onAvbryt={() => setSkede("hem")} />
        )}

        {skede === "status" && aktivtResultat && (
          <StatusVy
            resultat={aktivtResultat}
            streak={streak}
            svar={dagensSvar}
            premium={premium}
            onVisaPass={() => setSkede("intensity")}
            onInsikter={() => setSkede("insikter")}
            onNyCheckin={() => setSkede("checkin")}
            onUpgrade={() => oppnaUppgradera({ plan: "year", founding: false })}
          />
        )}

        {skede === "status" && !aktivtResultat && (
          <StartVy
            history={history}
            premium={premium}
            streak={streak}
            name={name}
            onCheckin={() => setSkede("checkin")}
            onPass={() => setSkede("intensity")}
            onInsikter={() => setSkede("insikter")}
            onPlan={(plan) => oppnaUppgradera({ plan, founding: false })}
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

      {/* Diskret utloggningsknapp — bara synlig när Supabase är konfigurerat */}
      {supabaseEnabled() && skede === "hem" && (
        <div className="fixed right-4 top-4 z-20">
          <button
            onClick={async () => { await signOut(); }}
            className="press flex h-9 w-9 items-center justify-center rounded-full text-text-tertiary hover:text-text-secondary"
            style={{ backgroundColor: "var(--bg-elevated)" }}
            aria-label="Logga ut"
            title="Logga ut"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
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

function LaddaSkarm() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg">
      <Wind
        size={28}
        strokeWidth={1.5}
        className="animate-pulse"
        style={{ color: "var(--accent)" }}
      />
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
