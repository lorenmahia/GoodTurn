"use client";

export default function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={`text-xl leading-none ${
            n <= value ? "text-amber-500" : "text-neutral-300 dark:text-neutral-600"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
