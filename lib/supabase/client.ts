"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

/** Returnerar nuvarande användar-id, eller null om ej inloggad. */
export async function ensureUser(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function getAccessToken(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Skapar ett nytt konto med e-post och lösenord. */
export async function signUpWithEmail(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase ej konfigurerat");
  return sb.auth.signUp({ email, password });
}

/** Loggar in med e-post och lösenord. */
export async function signInWithEmail(email: string, password: string) {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase ej konfigurerat");
  return sb.auth.signInWithPassword({ email, password });
}

/** Loggar ut och raderar lokal session. */
export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
}
