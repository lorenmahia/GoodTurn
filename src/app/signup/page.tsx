"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const inputCls =
  "w-full rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrors(typeof data.error === "object" && data.error ? data.error : { form: ["Signup failed. Please try again."] });
      setBusy(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/find-work");
    router.refresh();
  }

  const fieldError = (k: string) => errors[k]?.[0];

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-brand">Create your account</h1>
      <p className="mt-1 text-sm text-neutral-600">One account for finding work and posting jobs.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Display name</label>
          <input required value={form.displayName} onChange={set("displayName")} className={inputCls} />
          {fieldError("displayName") && <p className="mt-1 text-sm text-red-600">{fieldError("displayName")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input type="email" required value={form.email} onChange={set("email")} className={inputCls} />
          {fieldError("email") && <p className="mt-1 text-sm text-red-600">{fieldError("email")}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password (min 8 characters)</label>
          <input type="password" required value={form.password} onChange={set("password")} className={inputCls} />
          {fieldError("password") && <p className="mt-1 text-sm text-red-600">{fieldError("password")}</p>}
        </div>
        {fieldError("form") && <p className="text-sm text-red-600">{fieldError("form")}</p>}
        <button disabled={busy} className="w-full rounded bg-brand py-2.5 font-medium text-white hover:bg-accent disabled:opacity-50">
          {busy ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-sm text-neutral-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand underline">Log in</Link>
      </p>
    </div>
  );
}
