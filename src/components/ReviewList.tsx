import Stars from "./Stars";
import { REVIEW_CRITERIA, overallRating, type Direction } from "@/lib/reviews";
import type { RevealedReview } from "@/lib/reputation";

export default function ReviewList({ reviews }: { reviews: RevealedReview[] }) {
  if (reviews.length === 0) return null;
  return (
    <ul className="mt-4 space-y-3">
      {reviews.map((r, i) => {
        const labels = REVIEW_CRITERIA[r.direction as Direction];
        return (
          <li key={i} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex items-center justify-between gap-2">
              <Stars value={overallRating(r)} />
              <span className="text-xs text-neutral-500">{r.createdAt.toLocaleDateString()}</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              {r.authorName} · {r.jobTitle}
            </p>
            {r.comment && <p className="mt-2 text-sm text-neutral-800 dark:text-neutral-200">{r.comment}</p>}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
              <span>{labels[0]}: {r.ratingA}</span>
              <span>{labels[1]}: {r.ratingB}</span>
              <span>{labels[2]}: {r.ratingC}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
