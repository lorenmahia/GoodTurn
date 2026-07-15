"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverNote }),
    });
    setBusy(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(
        typeof data.error === "string" ? data.error : data.error?.coverNote?.[0] ?? "Could not submit application."
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-neutral-200 p-5">
      <h2 className="font-semibold text-brand">Apply for this job</h2>
      <textarea
        required
        rows={4}
        value={coverNote}
        onChange={(e) => setCoverNote(e.target.value)}
        placeholder="Tell the poster why you're the right fit (min 10 characters)"
        className="mt-3 w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button disabled={busy} className="mt-3 rounded bg-brand px-6 py-2 font-medium text-white hover:bg-accent disabled:opacity-50">
        {busy ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
