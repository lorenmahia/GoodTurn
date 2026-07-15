"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setBusy(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setErrors(typeof data.error === "object" && data.error ? data.error : { form: ["Something went wrong. Please try again."] });
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-brand">Thank you!</h1>
        <p className="mt-4 text-neutral-600">Your message has been received. We will get back to you shortly.</p>
      </div>
    );
  }

  const fieldError = (k: string) => errors[k]?.[0];

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-brand">Contact us</h1>
      <p className="mt-1 text-sm text-neutral-600">Questions about Goodturn? Send us a message.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          {fieldError("name") && <p className="mt-1 text-sm text-red-600">{fieldError("name")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          {fieldError("email") && <p className="mt-1 text-sm text-red-600">{fieldError("email")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Message</label>
          <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={inputCls} />
          {fieldError("message") && <p className="mt-1 text-sm text-red-600">{fieldError("message")}</p>}
        </div>
        {fieldError("form") && <p className="text-sm text-red-600">{fieldError("form")}</p>}
        <button disabled={busy} className="w-full rounded bg-brand py-2.5 font-medium text-white hover:bg-accent disabled:opacity-50">
          {busy ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
