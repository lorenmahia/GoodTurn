import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jobQuerySchema } from "@/lib/validation";
import { searchJobs } from "@/lib/jobs";
import { rankJobs } from "@/lib/match";
import JobCard, { type JobCardData } from "@/components/JobCard";
import QuickLinks from "@/components/QuickLinks";

export default async function FindWorkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/find-work");

  const raw = await searchParams;
  const parsed = jobQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : jobQuerySchema.parse({});
  const matchMode = raw.match === "1";

  let jobs: JobCardData[];
  if (matchMode) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
    const open = await prisma.job.findMany({
      where: { status: "OPEN", NOT: { posterId: user.id } },
      include: { category: true, poster: { select: { displayName: true } } },
    });
    jobs = rankJobs(user.skills, open.map((j) => ({ ...j, categoryName: j.category.name })));
  } else {
    jobs = await searchJobs(query);
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Find Work</p>
          <h1 className="mt-1 text-3xl font-extrabold text-brand dark:text-accent">
            {matchMode ? "Your best matches" : "Open jobs"}
          </h1>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {jobs.length} {matchMode ? "match" : "job"}{jobs.length === 1 ? "" : matchMode ? "es" : "s"} · welcome
          {session.user.name ? `, ${session.user.name}` : ""}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div>
          <form
            method="get"
            action="/find-work"
            className="sticky top-16 z-10 rounded-xl border border-neutral-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-ink/95"
          >
            <div className="flex flex-wrap gap-3">
              <input
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Search for work"
                className="min-w-48 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 focus:border-brand focus:outline-none dark:border-neutral-700 dark:bg-white/5 dark:focus:border-accent"
              />
              <select
                name="category"
                defaultValue={query.category ?? ""}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-white/5"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button className="rounded-lg bg-brand px-5 py-2 font-medium text-white transition hover:bg-accent">Search</button>
            </div>
            <details className="mt-3" open={query.minPrice !== undefined || query.maxPrice !== undefined || query.sort !== "newest"}>
              <summary className="cursor-pointer select-none rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white [display:inline-block]">
                More filters
              </summary>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <label>
                  Min KSh{" "}
                  <input name="minPrice" type="number" min="0" defaultValue={query.minPrice ?? ""} className="w-24 rounded-lg border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-white/5" />
                </label>
                <label>
                  Max KSh{" "}
                  <input name="maxPrice" type="number" min="0" defaultValue={query.maxPrice ?? ""} className="w-24 rounded-lg border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-white/5" />
                </label>
                <label>
                  Sort{" "}
                  <select name="sort" defaultValue={query.sort} className="rounded-lg border border-neutral-300 bg-white px-2 py-1 dark:border-neutral-700 dark:bg-white/5">
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                  </select>
                </label>
              </div>
            </details>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {matchMode
                ? "Ranked against the skills on your profile — improve your profile to sharpen the ranking."
                : "Newest first unless you sort otherwise."}
            </p>
            {matchMode ? (
              <Link href="/find-work" className="rounded-lg bg-neutral-200 px-4 py-2 text-sm font-medium transition hover:bg-neutral-300 dark:bg-white/10 dark:hover:bg-white/20">
                Back to all jobs
              </Link>
            ) : (
              <Link href="/find-work?match=1" className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-accent dark:hover:opacity-90">
                Find Best Match
              </Link>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          {jobs.length === 0 && (
            <p className="mt-10 text-center text-neutral-500 dark:text-neutral-400">
              {matchMode
                ? "No matches yet — add skills to your profile so we can match you."
                : "No jobs found. Try different filters."}
            </p>
          )}
        </div>
        <QuickLinks />
      </div>
    </div>
  );
}
