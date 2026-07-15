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
      <section className="rounded-2xl bg-gradient-to-r from-brand to-[#2a3568] px-6 py-10 text-white">
        <h1 className="text-3xl font-bold">Welcome{session.user.name ? `, ${session.user.name}` : ""}</h1>
        <p className="mt-2 text-lg text-neutral-200">Looking for work. We got you!!</p>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
        <div>
          <form method="get" action="/find-work" className="rounded-xl border border-neutral-200 p-4">
            <div className="flex flex-wrap gap-3">
              <input
                name="q"
                defaultValue={query.q ?? ""}
                placeholder="Search for Work"
                className="min-w-48 flex-1 rounded border border-neutral-300 px-3 py-2 focus:border-brand focus:outline-none"
              />
              <select
                name="category"
                defaultValue={query.category ?? ""}
                className="rounded border border-neutral-300 px-3 py-2"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <button className="rounded bg-brand px-5 py-2 font-medium text-white hover:bg-accent">Search</button>
            </div>
            <details className="mt-3" open={query.minPrice !== undefined || query.maxPrice !== undefined || query.sort !== "newest"}>
              <summary className="cursor-pointer select-none rounded bg-accent px-4 py-2 text-sm font-medium text-white [display:inline-block]">
                More filters
              </summary>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <label>
                  Min price{" "}
                  <input name="minPrice" type="number" min="0" defaultValue={query.minPrice ?? ""} className="w-24 rounded border border-neutral-300 px-2 py-1" />
                </label>
                <label>
                  Max price{" "}
                  <input name="maxPrice" type="number" min="0" defaultValue={query.maxPrice ?? ""} className="w-24 rounded border border-neutral-300 px-2 py-1" />
                </label>
                <label>
                  Sort{" "}
                  <select name="sort" defaultValue={query.sort} className="rounded border border-neutral-300 px-2 py-1">
                    <option value="newest">Newest</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                  </select>
                </label>
              </div>
            </details>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-neutral-600">
              {matchMode
                ? `Best matches for your skills — ${jobs.length} found. Complete your profile to make it more accurate.`
                : `${jobs.length} open job${jobs.length === 1 ? "" : "s"}`}
            </p>
            {matchMode ? (
              <Link href="/find-work" className="rounded bg-neutral-200 px-4 py-2 text-sm font-medium hover:bg-neutral-300">
                Back to all jobs
              </Link>
            ) : (
              <Link href="/find-work?match=1" className="rounded bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700">
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
            <p className="mt-10 text-center text-neutral-500">
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
