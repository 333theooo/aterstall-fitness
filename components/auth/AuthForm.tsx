"use client";

import { useState } from "react";
import { ArrowLeft, Check, Eye, EyeOff, Wind } from "lucide-react";
import { signInWithEmail, signUpWithEmail, setRememberLogin } from "@/lib/supabase/client";

type Mode = "signup" | "login";

interface Props {
  initialMode?: Mode;
  onTillbaka: () => void;
  onSuccess: () => void;
}

export default function AuthForm({ initialMode = "signup", onTillbaka, onSuccess }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visaLosenord, setVisaLosenord] = useState(false);
  const [komIhag, setKomIhag] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bekraftelse, setBekraftelse] = useState(false);

  async function skicka(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: err } = await signUpWithEmail(email.trim(), password, name.trim() || undefined);
        if (err) {
          setError(tolkFel(err.message));
          return;
        }
        if (data.user && !data.session) {
          // Email-bekräftelse krävs → visa info-skärm
          setBekraftelse(true);
        } else if (data.session) {
          // Konto skapat direkt → visa välkomstanimation
          onSuccess();
        }
      } else {
        const { error: err } = await signInWithEmail(email.trim(), password);
        if (err) {
          setError(tolkFel(err.message));
        } else {
          setRememberLogin(komIhag);
          // Inloggad → visa välkomstanimation
          onSuccess();
        }
      }
    } finally {
      setLoading(false);
    }
  }

  if (bekraftelse) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="mx-auto w-full max-w-xs text-center animate-enter">
          <div
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <Wind size={24} strokeWidth={1.5} />
          </div>
          <h1 className="text-heading text-text-primary">Kolla din e-post</h1>
          <p className="mt-4 text-body text-text-secondary">
            Vi har skickat en bekräftelselänk till{" "}
            <strong className="text-text-primary">{email}</strong>. Klicka på
            länken för att aktivera ditt konto.
          </p>
          <button
            onClick={onTillbaka}
            className="press mt-8 inline-flex min-h-11 items-center gap-2 text-bodysm text-text-secondary"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Tillbaka
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-10 pt-12">
      {/* Tillbaka */}
      <button
        onClick={onTillbaka}
        className="press mb-8 flex min-h-11 w-fit items-center gap-2 text-bodysm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Tillbaka
      </button>

      <div className="mx-auto w-full max-w-xs flex-1">
        {/* Rubrik */}
        <div className="mb-8 animate-enter">
          <div
            className="mb-5 flex h-11 w-11 items-center justify-center rounded-[14px]"
            style={{
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--separator)",
            }}
          >
            <Wind size={20} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-heading text-text-primary">
            {mode === "signup" ? "Skapa konto" : "Välkommen tillbaka"}
          </h1>
          <p className="mt-2 text-bodysm text-text-secondary">
            {mode === "signup"
              ? "Gratis att börja. Uppgradera när du vill."
              : "Logga in på ditt konto."}
          </p>
        </div>

        {/* Formulär */}
        <form
          onSubmit={skicka}
          className="animate-enter"
          style={{ animationDelay: "60ms" }}
        >
          <div className="grid gap-3">
            {/* Namn (enbart vid signup) */}
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-caption text-text-tertiary"
                >
                  Ditt förnamn
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Förnamn"
                  className="field-input w-full px-4 text-body placeholder:text-text-tertiary"
                />
              </div>
            )}

            {/* E-post */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-caption text-text-tertiary"
              >
                E-postadress
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.se"
                className="field-input w-full px-4 text-body placeholder:text-text-tertiary"
              />
            </div>

            {/* Lösenord */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-caption text-text-tertiary"
              >
                Lösenord
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={visaLosenord ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Minst 8 tecken" : "••••••••"}
                  className="field-input w-full px-4 pr-12 text-body placeholder:text-text-tertiary"
                />
                <button
                  type="button"
                  onClick={() => setVisaLosenord((v) => !v)}
                  className="press absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-tertiary hover:text-text-secondary"
                  aria-label={visaLosenord ? "Dölj lösenord" : "Visa lösenord"}
                >
                  {visaLosenord ? (
                    <EyeOff size={16} strokeWidth={1.5} />
                  ) : (
                    <Eye size={16} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {/* Kom ihåg mig — bara i inloggningsläge */}
            {mode === "login" && (
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={komIhag}
                  onClick={() => setKomIhag((v) => !v)}
                  className="press flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[5px]"
                  style={{
                    backgroundColor: komIhag ? "var(--accent)" : "var(--bg-elevated)",
                    border: komIhag ? "1px solid var(--accent)" : "1px solid var(--separator)",
                    transition: "background-color 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  {komIhag && (
                    <Check size={11} strokeWidth={2.5} style={{ color: "var(--bg)" }} />
                  )}
                </button>
                <span className="text-caption text-text-secondary">Kom ihåg mig</span>
              </div>
            )}
          </div>

          {/* Fel */}
          {error && (
            <div
              className="mt-4 rounded-[var(--radius-card-inner)] px-4 py-3 text-bodysm animate-enter"
              style={{
                backgroundColor: "rgba(239,68,68,0.1)",
                color: "#f87171",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            type="submit"
            disabled={loading}
            className="press mt-5 flex w-full items-center justify-center rounded-[var(--radius-btn)] text-bodysm font-semibold disabled:opacity-60"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--bg)",
              minHeight: "52px",
              transition: "opacity 0.2s ease",
            }}
          >
            {loading ? (
              <Spinner />
            ) : mode === "signup" ? (
              "Skapa konto"
            ) : (
              "Logga in"
            )}
          </button>
        </form>

        {/* Byt läge */}
        <p
          className="mt-6 text-center text-bodysm text-text-tertiary animate-enter"
          style={{ animationDelay: "120ms" }}
        >
          {mode === "signup" ? (
            <>
              Har du redan ett konto?{" "}
              <button
                onClick={() => { setMode("login"); setError(null); }}
                className="press font-medium"
                style={{ color: "var(--accent)" }}
              >
                Logga in
              </button>
            </>
          ) : (
            <>
              Inget konto?{" "}
              <button
                onClick={() => { setMode("signup"); setError(null); }}
                className="press font-medium"
                style={{ color: "var(--accent)" }}
              >
                Skapa ett
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function tolkFel(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Fel e-post eller lösenord.";
  if (msg.includes("Email already registered") || msg.includes("already registered"))
    return "Det finns redan ett konto med den e-postadressen.";
  if (msg.includes("Password should be at least"))
    return "Lösenordet måste vara minst 8 tecken.";
  if (msg.includes("Unable to validate email"))
    return "Kontrollera att e-postadressen är korrekt.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "För många försök. Vänta lite och försök igen.";
  return "Något gick fel. Försök igen.";
}
