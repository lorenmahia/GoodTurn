"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProfileData = { displayName: string; bio: string; skills: string; hourlyRate: number };

const inputCls =
  "w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none";

export default function ProfileForm({ user }: { user: ProfileData }) {
  const router = useRouter();
  const [form, setForm] = useState(user);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, hourlyRate: Number(form.hourlyRate) }),
    });
    setBusy(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setErrors(typeof data.error === "object" && data.error ? data.error : { form: ["Could not save profile."] });
    }
  }

  const fieldError = (k: string) => errors[k]?.[0];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Display name</label>
        <input required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className={inputCls} />
        {fieldError("displayName") && <p className="mt-1 text-sm text-red-600">{fieldError("displayName")}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Bio</label>
        <textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Skills (comma-separated — used by Find Best Match)</label>
        <input
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          placeholder="e.g. writing, react, design"
          className={inputCls}
        />
        {fieldError("skills") && <p className="mt-1 text-sm text-red-600">{fieldError("skills")}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Hourly rate (KSh/h)</label>
        <input
          type="number" min="0" step="0.5"
          value={form.hourlyRate}
          onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })}
          className={inputCls}
        />
        {fieldError("hourlyRate") && <p className="mt-1 text-sm text-red-600">{fieldError("hourlyRate")}</p>}
      </div>
      {fieldError("form") && <p className="text-sm text-red-600">{fieldError("form")}</p>}
      {saved && <p className="text-sm font-medium text-green-700">Profile saved.</p>}
      <button disabled={busy} className="rounded bg-brand px-8 py-2.5 font-medium text-white hover:bg-accent disabled:opacity-50">
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
