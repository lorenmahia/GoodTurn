export default function Stars({ value }: { value: number }) {
  const filled = Math.round(value);
  return (
    <span className="text-amber-500" aria-label={`${value.toFixed(1)} out of 5`}>
      {"★".repeat(filled)}
      <span className="text-neutral-300 dark:text-neutral-600">{"★".repeat(5 - filled)}</span>
    </span>
  );
}
