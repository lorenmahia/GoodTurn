"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { findContactInfo, CONTACT_BLOCK_MESSAGE } from "@/lib/moderation";

const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-white/5 dark:text-neutral-100 dark:focus:border-accent";

type SavedResume = { id: string; fileName: string } | null;

export default function ApplyForm({
  jobId,
  defaultName,
  defaultLocation,
}: {
  jobId: string;
  defaultName: string;
  defaultLocation: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [location, setLocation] = useState(defaultLocation);
  const [coverNote, setCoverNote] = useState("");
  const [savedResume, setSavedResume] = useState<SavedResume>(null);
  const [useSaved, setUseSaved] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    fetch("/api/resume")
      .then((r) => (r.ok ? r.json() : { resume: null }))
      .then((d) => setSavedResume(d.resume ?? null))
      .catch(() => setSavedResume(null));
  }, []);

  const contactHits = useMemo(
    () => findContactInfo(`${name}\n${location}\n${coverNote}`),
    [name, location, coverNote]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current || contactHits.length > 0) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    try {
      let resumeId: string | undefined;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/resume", { method: "POST", body: fd });
        const upData = await up.json().catch(() => ({}));
        if (!up.ok) {
          setError(typeof upData.error === "string" ? upData.error : "Resume upload failed.");
          return;
        }
        resumeId = upData.resume.id;
      } else if (useSaved && savedResume) {
        resumeId = savedResume.id;
      }

      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location, coverNote, resumeId }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(
        typeof data.error === "string"
          ? data.error
          : data.error?.coverNote?.[0] ?? data.error?.name?.[0] ?? data.error?.location?.[0] ?? "Could not submit application."
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-white/5"
    >
      <h2 className="text-lg font-bold text-brand dark:text-accent">Apply for this job</h2>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        Your details are prefilled from your profile — edit them and we&apos;ll remember for next time.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input required minLength={2} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <input required minLength={2} maxLength={80} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Nairobi" className={inputCls} />
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium">
          Resume <span className="font-normal text-neutral-500 dark:text-neutral-400">(optional, PDF up to 2 MB)</span>
        </label>
        {savedResume && !file && (
          <label className="mb-2 flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm dark:bg-white/10">
            <input type="checkbox" checked={useSaved} onChange={(e) => setUseSaved(e.target.checked)} />
            Use saved resume: <span className="font-medium">{savedResume.fileName}</span>
          </label>
        )}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent dark:text-neutral-400"
        />
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium">Why you can do this job</label>
        <textarea
          required
          rows={5}
          minLength={10}
          maxLength={2000}
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          placeholder="Speak to this brief: relevant work you&#39;ve done, how you&#39;d approach it, and when you can deliver."
          className={inputCls}
        />
      </div>

      {contactHits.length > 0 && (
        <p className="mt-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {CONTACT_BLOCK_MESSAGE} (found: {contactHits[0].match})
        </p>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        disabled={busy || contactHits.length > 0}
        className="mt-4 w-full rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:bg-accent disabled:opacity-50"
      >
        {busy ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
