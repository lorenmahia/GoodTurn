"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { suggestedTotal } from "@/lib/rules";
import { formatKES, formatKESRate } from "@/lib/currency";
import { findContactInfo, CONTACT_BLOCK_MESSAGE } from "@/lib/moderation";

type Category = { id: string; name: string };

const inputCls =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-white/5 dark:text-neutral-100 dark:focus:border-accent";

const sectionCls =
  "rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-white/5";

export default function PostJobForm({
  categories,
  medians,
}: {
  categories: Category[];
  medians: Record<string, number>;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: categories[0]?.id ?? "",
    estimatedHours: "",
    paymentType: "FIXED" as "FIXED" | "HOURLY",
    price: "",
    hourlyRate: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  const hours = Number(form.estimatedHours);
  const medianRate = medians[form.categoryId];
  const contactHits = useMemo(
    () => findContactInfo(`${form.title}\n${form.description}`),
    [form.title, form.description]
  );
  const estimatedTotal =
    form.paymentType === "HOURLY" && Number(form.hourlyRate) > 0 && hours > 0
      ? suggestedTotal(Number(form.hourlyRate), hours)
      : null;
  const typicalTotal =
    form.paymentType === "FIXED" && medianRate && hours > 0 ? suggestedTotal(medianRate, hours) : null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return; // double-click: state updates are async, refs are not
    if (contactHits.length > 0) return;
    inFlight.current = true;
    setBusy(true);
    setErrors({});
    try {
      const payload =
        form.paymentType === "FIXED"
          ? { title: form.title, description: form.description, categoryId: form.categoryId, estimatedHours: hours, paymentType: "FIXED", price: Number(form.price) }
          : { title: form.title, description: form.description, categoryId: form.categoryId, estimatedHours: hours, paymentType: "HOURLY", hourlyRate: Number(form.hourlyRate) };
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.push(`/jobs/${data.job.id}`);
        return;
      }
      setErrors(
        typeof data.error === "object" && data.error ? data.error : { form: [String(data.error ?? "Failed to post job")] }
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const fieldError = (k: string) => errors[k]?.[0];
  const toggleCls = (active: boolean) =>
    `flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
      active
        ? "border-brand bg-brand text-white dark:border-accent dark:bg-accent"
        : "border-neutral-300 text-neutral-700 hover:border-brand dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-accent"
    }`;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className={sectionCls}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          1 · Describe the work
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Job title</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
            {fieldError("title") && <p className="mt-1 text-sm text-red-600">{fieldError("title")}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              required
              rows={6}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputCls}
              placeholder="Describe the work, deliverables, and any requirements (min 20 characters)"
            />
            {fieldError("description") && <p className="mt-1 text-sm text-red-600">{fieldError("description")}</p>}
          </div>
        </div>
      </section>

      <section className={sectionCls}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          2 · Scope
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Estimated hours</label>
            <input
              type="number" min="0.5" step="0.5" required
              value={form.estimatedHours}
              onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
              className={inputCls}
            />
            {fieldError("estimatedHours") && <p className="mt-1 text-sm text-red-600">{fieldError("estimatedHours")}</p>}
          </div>
        </div>
      </section>

      <section className={sectionCls}>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          3 · Pricing
        </h2>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={() => setForm({ ...form, paymentType: "FIXED" })} className={toggleCls(form.paymentType === "FIXED")}>
            Pay a total amount
          </button>
          <button type="button" onClick={() => setForm({ ...form, paymentType: "HOURLY" })} className={toggleCls(form.paymentType === "HOURLY")}>
            Pay by the hour
          </button>
        </div>

        {form.paymentType === "FIXED" ? (
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">Total budget (KSh)</label>
            <input
              type="number" min="1" step="0.01" required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className={inputCls}
            />
            {fieldError("price") && <p className="mt-1 text-sm text-red-600">{fieldError("price")}</p>}
            {typicalTotal !== null && (
              <p className="mt-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700 dark:bg-white/10 dark:text-neutral-300">
                Similar jobs at {hours}h typically total <strong>{formatKES(Math.round(typicalTotal * 0.8))}–{formatKES(Math.round(typicalTotal * 1.25))}</strong>{" "}
                (around {formatKES(typicalTotal)}). You decide — any amount posts.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">Hourly rate (KSh/h)</label>
            <input
              type="number" min="1" step="0.01" required
              value={form.hourlyRate}
              onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
              className={inputCls}
            />
            {fieldError("hourlyRate") && <p className="mt-1 text-sm text-red-600">{fieldError("hourlyRate")}</p>}
            <div className="mt-2 space-y-1 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700 dark:bg-white/10 dark:text-neutral-300">
              {medianRate !== undefined && (
                <p>
                  Jobs in this category typically pay <strong>{formatKES(Math.round(medianRate * 0.8))}–{formatKES(Math.round(medianRate * 1.25))}/h</strong>{" "}
                  (around {formatKESRate(medianRate)}). You decide — any rate posts.
                </p>
              )}
              {estimatedTotal !== null && (
                <p>
                  Estimated total: <strong>{formatKES(estimatedTotal)}</strong> for {hours}h.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {contactHits.length > 0 && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {CONTACT_BLOCK_MESSAGE} (found: {contactHits[0].match})
        </p>
      )}
      {fieldError("form") && <p className="text-sm text-red-600">{fieldError("form")}</p>}

      <button
        disabled={busy || contactHits.length > 0}
        className="rounded-lg bg-brand px-8 py-3 font-semibold text-white transition hover:bg-accent disabled:opacity-50"
      >
        {busy ? "Posting…" : "Post Job"}
      </button>
    </form>
  );
}
