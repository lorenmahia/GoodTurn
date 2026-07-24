"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "./StarRating";
import { REVIEW_CRITERIA, type Direction } from "@/lib/reviews";

export default function ReviewForm({
  connectionId,
  direction,
}: {
  connectionId: string;
  direction: Direction;
}) {
  const router = useRouter();
  const labels = REVIEW_CRITERIA[direction];
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    if (a === 0 || b === 0 || c === 0) {
      setError("Please rate all three criteria.");
      return;
    }
    inFlight.current = true; // synchronous lock — state updates are async
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/connect/${connectionId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratingA: a, ratingB: b, ratingC: c, comment: comment || undefined }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.error?.comment?.[0] ??
          (typeof data?.error === "string" ? data.error : "Could not submit review.");
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
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <h3 className="font-bold">Leave a review</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">{labels[0]}</span>
        <StarRating value={a} onChange={setA} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">{labels[1]}</span>
        <StarRating value={b} onChange={setB} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">{labels[2]}</span>
        <StarRating value={c} onChange={setC} />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        placeholder="Optional comment (no phone numbers or emails)"
        className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-white/5"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-brand px-5 py-2 font-medium text-white transition hover:bg-accent disabled:opacity-50"
      >
        Submit review
      </button>
    </form>
  );
}
