import { REVIEW_CRITERIA, type Direction } from "@/lib/reviews";

export default function JobSuccessScore({
  score,
  count,
  breakdown,
  direction,
}: {
  score: number | null;
  count: number;
  breakdown: { a: number; b: number; c: number } | null;
  direction: Direction;
}) {
  if (score === null || breakdown === null) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">No reviews yet.</p>;
  }
  const labels = REVIEW_CRITERIA[direction];
  return (
    <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-brand dark:text-accent">{score.toFixed(1)}</span>
        <span className="text-neutral-500">/ 5</span>
        <span className="ml-2 text-sm text-neutral-500">
          from {count} review{count === 1 ? "" : "s"}
        </span>
      </div>
      <dl className="mt-3 space-y-1 text-sm text-neutral-700 dark:text-neutral-300">
        <div className="flex justify-between">
          <dt>{labels[0]}</dt>
          <dd>{breakdown.a.toFixed(1)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{labels[1]}</dt>
          <dd>{breakdown.b.toFixed(1)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{labels[2]}</dt>
          <dd>{breakdown.c.toFixed(1)}</dd>
        </div>
      </dl>
    </div>
  );
}
