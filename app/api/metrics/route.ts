import { getSupabaseAdmin, adminEnabled } from "@/lib/supabase/admin";
import { PLANS } from "@/lib/pricing";

export const runtime = "nodejs";

// KPI-endpoint för intäktsanalys. Kräver intern API-nyckel.
// Returnerar konverteringstratt, MRR-proxy, annual share och dunning-återhämtning.
// Läses av monitoring-tooling (Grafana, Retool, etc.) — aldrig av klienten.
export async function GET(request: Request) {
  const apiKey = request.headers.get("x-metrics-key");
  if (!apiKey || apiKey !== process.env.METRICS_API_KEY) {
    return new Response("Obehörig", { status: 401 });
  }

  if (!adminEnabled()) {
    return new Response("Supabase ej konfigurerat", { status: 501 });
  }

  const admin = getSupabaseAdmin();

  const [
    { count: paywallShown },
    { count: checkoutStarted },
    { count: checkoutCompleted },
    { count: paymentFailed },
    { count: paymentRecovered },
    { count: bridgeShown },
    { count: bridgeTaken },
    { count: premiumYear },
    { count: premiumMonth },
    { count: totalPremium },
  ] = await Promise.all([
    admin.from("revenue_events").select("*", { count: "exact", head: true }).eq("type", "paywall_shown"),
    admin.from("revenue_events").select("*", { count: "exact", head: true }).eq("type", "checkout_started"),
    admin.from("revenue_events").select("*", { count: "exact", head: true }).eq("type", "checkout_completed"),
    admin.from("revenue_events").select("*", { count: "exact", head: true }).eq("type", "payment_failed"),
    admin.from("revenue_events").select("*", { count: "exact", head: true }).eq("type", "payment_recovered"),
    admin.from("revenue_events").select("*", { count: "exact", head: true }).eq("type", "bridge_offer_shown"),
    admin.from("revenue_events").select("*", { count: "exact", head: true }).eq("type", "bridge_offer_taken"),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "year").eq("premium", true),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("plan", "month").eq("premium", true),
    admin.from("profiles").select("*", { count: "exact", head: true }).eq("premium", true),
  ]);

  const yearCount = premiumYear ?? 0;
  const monthCount = premiumMonth ?? 0;
  const premiumTotal = totalPremium ?? 0;

  // MRR-proxy i öre
  const mrrOre =
    yearCount * Math.round(PLANS.year.amount / 12) +
    monthCount * PLANS.month.amount;

  const safeDiv = (a: number | null, b: number | null) =>
    b && b > 0 ? Math.round(((a ?? 0) / b) * 1000) / 10 : null;

  return Response.json({
    funnel: {
      paywall_shown: paywallShown ?? 0,
      checkout_started: checkoutStarted ?? 0,
      checkout_completed: checkoutCompleted ?? 0,
      paywall_to_checkout_pct: safeDiv(checkoutStarted, paywallShown),
      checkout_conversion_pct: safeDiv(checkoutCompleted, checkoutStarted),
    },
    revenue: {
      premium_total: premiumTotal,
      premium_year: yearCount,
      premium_month: monthCount,
      annual_share_pct: safeDiv(yearCount, yearCount + monthCount),
      mrr_ore: mrrOre,
    },
    bridge: {
      shown: bridgeShown ?? 0,
      taken: bridgeTaken ?? 0,
      take_rate_pct: safeDiv(bridgeTaken, bridgeShown),
    },
    dunning: {
      payment_failed: paymentFailed ?? 0,
      payment_recovered: paymentRecovered ?? 0,
      recovery_rate_pct: safeDiv(paymentRecovered, paymentFailed),
    },
    generated_at: new Date().toISOString(),
  });
}
