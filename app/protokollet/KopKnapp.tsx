"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

// Köp-knapp för engångsprodukten. Stripe → redirect. Utan Stripe (dev) →
// gå direkt till tack-sidan i förhandsläge så flödet går att se.
export default function KopKnapp() {
  const [laddar, setLaddar] = useState(false);

  async function kop() {
    setLaddar(true);
    try {
      const res = await fetch("/api/protokoll-checkout", { method: "POST" });
      if (res.status === 501) {
        window.location.href = "/protokollet/tack?dev=1";
        return;
      }
      if (!res.ok) throw new Error("checkout");
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch {
      setLaddar(false);
    }
  }

  return (
    <Button
      variant="status"
      statusColor="var(--redo)"
      onClick={kop}
      disabled={laddar}
    >
      <span>{laddar ? "Öppnar kassan…" : "Köp protokollet"}</span>
      <span>19 kr</span>
    </Button>
  );
}
