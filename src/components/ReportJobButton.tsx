"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { REPORT_REASONS, REPORT_REASON_LABEL } from "@/lib/trust";

export default function ReportJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${jobId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, note: note || undefined }),
      });
      if (res.ok) {
        setDone(true);
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Could not send the report.");
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  if (done) return <p className="text-sm font-medium text-green-700 dark:text-green-400">Reported — thank you.</p>;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-neutral-500 underline-offset-2 hover:text-red-600 hover:underline dark:text-neutral-400"
      >
        Report this job
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-2 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-white/5"
      >
        {REPORT_REASONS.map((r) => (
          <option key={r} value={r}>{REPORT_REASON_LABEL[r]}</option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={1000}
        placeholder="Anything else we should know? (optional)"
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-white/5"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50">
          Submit report
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-neutral-200 px-4 py-1.5 text-sm font-medium dark:bg-white/10">
          Cancel
        </button>
      </div>
    </form>
  );
}
