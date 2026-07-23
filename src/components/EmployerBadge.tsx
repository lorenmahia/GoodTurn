import { employerBadge, EMPLOYER_BADGE_LABEL } from "@/lib/trust";

export default function EmployerBadge({
  isVerified,
  completedHires,
}: {
  isVerified: boolean;
  completedHires: number;
}) {
  const badge = employerBadge({ isVerified, completedHires });
  if (!badge) return null;
  const cls =
    badge === "verified"
      ? "bg-brand text-white dark:bg-accent"
      : "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
  return (
    <span
      title={badge === "verified" ? "Verified by Goodturn" : "Has completed at least one hire on Goodturn"}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      ✓ {EMPLOYER_BADGE_LABEL[badge]}
    </span>
  );
}
