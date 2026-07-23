"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function MessageComposer({ connectionId }: { connectionId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current || body.trim().length === 0) return;
    inFlight.current = true; // synchronous lock — state updates are async
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/connect/${connectionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        setBody("");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.error?.body?.[0] ?? (typeof data?.error === "string" ? data.error : "Message not sent.");
        setError(msg);
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={send} className="mt-2">
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          placeholder="Write a message…"
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-white/5 dark:focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand px-5 py-2 font-medium text-white transition hover:bg-accent disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}
