"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Webbläsarklient med anonym inloggning — passar varumärkets anonymitet:
// ingen e-post, inget lösenord, men en riktig auth.users-rad (RLS via
// auth.uid()) och persistent session i localStorage.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseEnabled(): boolean {
  return Boolean(url && anon);
}

let klient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled()) return null;
  if (!klient) {
    klient = createClient(url as string, anon as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return klient;
}

/** Returnerar nuvarande användar-id, loggar in anonymt vid behov. */
export async function ensureUser(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data: sessionData } = await sb.auth.getSession();
  if (sessionData.session?.user) return sessionData.session.user.id;

  const { data, error } = await sb.auth.signInAnonymously();
  if (error) {
    console.error("Anonym inloggning misslyckades", error.message);
    return null;
  }
  return data.user?.id ?? null;
}

export async function getAccessToken(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}
