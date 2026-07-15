"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTIONS: { status: "WISHLISTED" | "ACCEPTED" | "DENIED"; label: string; cls: string }[] = [
  { status: "WISHLISTED", label: "Wishlist", cls: "bg-accent text-white" },
  { status: "ACCEPTED", label: "Accept", cls: "bg-brand text-white" },
  { status: "DENIED", label: "Deny", cls: "bg-neutral-200 text-neutral-800" },
];

export default function ApplicantActions({ applicationId, status }: { applicationId: string; status: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (status === "ACCEPTED" || status === "DENIED") {
    return <span className={`text-sm font-semibold ${status === "ACCEPTED" ? "text-brand" : "text-neutral-500"}`}>{status}</span>;
  }

  async function act(next: string) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Action failed.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "WISHLISTED" && <span className="text-xs font-semibold text-accent">WISHLISTED</span>}
      {ACTIONS.filter((a) => !(status === "WISHLISTED" && a.status === "WISHLISTED")).map((a) => (
        <button
          key={a.status}
          disabled={busy}
          onClick={() => act(a.status)}
          className={`rounded px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${a.cls}`}
        >
          {a.label}
        </button>
      ))}
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </div>
  );
}
