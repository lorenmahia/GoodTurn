import Link from "next/link";

export type JobCardData = {
  id: string;
  title: string;
  description: string;
  price: number;
  estimatedHours: number;
  status: string;
  createdAt: Date;
  category: { name: string };
  poster: { displayName: string };
  score?: number;
};

export default function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-brand hover:shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-brand">{job.title}</h3>
        <span className="whitespace-nowrap rounded bg-ink px-2 py-1 text-sm font-semibold text-white">
          ${job.price}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{job.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
        <span className="rounded-full bg-accent/15 px-2 py-0.5 font-medium text-accent">{job.category.name}</span>
        <span>~{job.estimatedHours}h</span>
        <span>by {job.poster.displayName}</span>
        {typeof job.score === "number" && (
          <span className="ml-auto font-semibold text-brand">match score {job.score}</span>
        )}
      </div>
    </Link>
  );
}
