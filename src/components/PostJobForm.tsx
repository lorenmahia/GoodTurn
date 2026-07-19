"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { minimumPrice } from "@/lib/rules";

type Category = { id: string; name: string; typicalHourlyRate: number };

const inputCls =
  "w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none";

export default function PostJobForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: categories[0]?.id ?? "",
    estimatedHours: "",
    price: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const category = categories.find((c) => c.id === form.categoryId);
  const hours = Number(form.estimatedHours);
  const minPrice = useMemo(
    () => (category && hours > 0 ? minimumPrice(category.typicalHourlyRate, hours) : null),
    [category, hours]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        estimatedHours: Number(form.estimatedHours),
        price: Number(form.price),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      router.push(`/jobs/${data.job.id}`);
    } else {
      setErrors(
        typeof data.error === "object" && data.error ? data.error : { form: [String(data.error ?? "Failed to post job")] }
      );
    }
  }

  const fieldError = (k: string) => errors[k]?.[0];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
      <div className="grid gap-4 sm:grid-cols-3">
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
        <div>
          <label className="mb-1 block text-sm font-medium">Price (USD)</label>
          <input
            type="number" min="1" step="0.01" required
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className={inputCls}
          />
          {fieldError("price") && <p className="mt-1 text-sm text-red-600">{fieldError("price")}</p>}
        </div>
      </div>
      {minPrice !== null && (
        <p className="rounded bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
          Minimum for <strong>{category!.name}</strong> at <strong>{hours}h</strong>: <strong>${minPrice}</strong>{" "}
          — you set the price, but it must meet the category minimum so freelancers apply.
        </p>
      )}
      {fieldError("form") && <p className="text-sm text-red-600">{fieldError("form")}</p>}
      <button disabled={busy} className="rounded bg-brand px-8 py-2.5 font-medium text-white hover:bg-accent disabled:opacity-50">
        {busy ? "Posting…" : "Post Job"}
      </button>
    </form>
  );
}
