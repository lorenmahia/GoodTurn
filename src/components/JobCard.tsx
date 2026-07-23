import Link from "next/link";
import { formatKES, formatKESRate } from "@/lib/currency";
import EmployerBadge from "@/components/EmployerBadge";

export type JobCardData = {
  id: string;
  title: string;
  description: string;
  price: number;
  estimatedHours: number;
  paymentType: string;
  hourlyRate: number | null;
  status: string;
  createdAt: Date;
  category: { name: string };
  poster: { displayName: string; isVerified: boolean; completedHires: number };
  score?: number;
};

export default function JobCard({ job }: { job: JobCardData }) {
  const priceLabel =
    job.paymentType === "HOURLY" && job.hourlyRate ? formatKESRate(job.hourlyRate) : `${formatKES(job.price)} fixed`;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-lg dark:border-neutral-800 dark:bg-white/5 dark:hover:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-brand dark:text-accent">{job.title}</h3>
        <span className="whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-sm font-semibold text-white dark:bg-white/10">
          {priceLabel}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{job.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="rounded-full bg-accent/15 px-2 py-0.5 font-medium text-accent">{job.category.name}</span>
        <span>~{job.estimatedHours}h</span>
        <span className="inline-flex items-center gap-1.5">
          by {job.poster.displayName}
          <EmployerBadge isVerified={job.poster.isVerified} completedHires={job.poster.completedHires} />
        </span>
        {typeof job.score === "number" && (
          <span className="ml-auto font-semibold text-brand dark:text-accent">match score {job.score}</span>
        )}
      </div>
    </Link>
  );
}
