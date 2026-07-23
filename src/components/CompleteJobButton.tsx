"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  async function complete() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) router.refresh();
      else {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Could not complete the job.");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={complete}
        disabled={busy}
        className="rounded bg-ink px-4 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-accent dark:hover:opacity-90"
      >
        Mark completed
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </span>
  );
}
