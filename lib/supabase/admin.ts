import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role-klient — endast server. Bypassar RLS för webhook-skrivningar
// (premium-flaggan får aldrig sättas från klienten).

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function adminEnabled(): boolean {
  return Boolean(url && serviceKey);
}

let admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!url || !serviceKey) {
    throw new Error("Supabase service-role saknas (env ej konfigurerad).");
  }
  if (!admin) {
    admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
