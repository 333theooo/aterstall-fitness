"use client";

// Web Push — kräver VAPID-nycklar i miljövariabler:
//   NEXT_PUBLIC_VAPID_PUBLIC_KEY  (publik, safe att exponera)
//   VAPID_PRIVATE_KEY             (hemlig, server-only)
//   VAPID_SUBJECT                 (mailto: eller URL)
//
// Generera nycklar: npx web-push generate-vapid-keys
// Prenumerationer lagras i Supabase.push_subscriptions (Chunk B schema).
//
// Push skickas aldrig utan explicit användarmedgivande.
// Inga marknadsförings-push utan opt-in. Ingen spam.

export function pushEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
}

export async function subscribeToPush(accessToken: string): Promise<boolean> {
  if (!pushEnabled()) return false;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    const registration = await navigator.serviceWorker.ready;
    const existingSub = await registration.pushManager.getSubscription();
    const sub =
      existingSub ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ) as unknown as BufferSource,
      }));

    const { endpoint, keys } = sub.toJSON() as {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth, accessToken }),
    });

    return res.ok;
  } catch {
    return false;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
