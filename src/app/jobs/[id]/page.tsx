import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { formatKES, formatKESRate } from "@/lib/currency";
import ApplyForm from "@/components/ApplyForm";
import ApplicantActions from "@/components/ApplicantActions";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/jobs/${id}`);

  const job = await prisma.job.findUnique({
    where: { id },
    include: { category: true, poster: { select: { id: true, displayName: true } } },
  });
  if (!job) notFound();

  const isPoster = job.posterId === session.user.id;
  const me = isPoster
    ? null
    : await prisma.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { displayName: true, location: true },
      });
  const myApplication = isPoster
    ? null
    : await prisma.application.findUnique({
        where: { jobId_applicantId: { jobId: id, applicantId: session.user.id } },
      });
  const applications = isPoster
    ? await prisma.application.findMany({
        where: { jobId: id },
        include: {
          applicant: { select: { displayName: true, skills: true, hourlyRate: true, publicUserId: true } },
          resume: { select: { id: true, fileName: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const priceLabel =
    job.paymentType === "HOURLY" && job.hourlyRate
      ? `${formatKESRate(job.hourlyRate)} · ~${job.estimatedHours}h`
      : `${formatKES(job.price)} fixed`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{job.category.name}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand dark:text-accent">{job.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="rounded-full bg-ink px-3 py-1 font-semibold text-white dark:bg-white/10">{priceLabel}</span>
            <span>~{job.estimatedHours}h</span>
            <span>posted by {job.poster.displayName}</span>
            <span className="text-xs font-semibold uppercase tracking-wide">{job.status.replace("_", " ")}</span>
          </div>
          <p className="mt-8 whitespace-pre-line leading-relaxed text-neutral-800 dark:text-neutral-200">{job.description}</p>
        </div>

        <div>
          {isPoster ? null : myApplication ? (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-white/5">
              <p className="font-medium">
                You applied on {myApplication.createdAt.toLocaleDateString()} — status:{" "}
                <span className="font-bold text-brand dark:text-accent">{myApplication.status}</span>
              </p>
              {myApplication.status === "ACCEPTED" && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Congratulations! You&apos;ll coordinate the work through Goodturn Connect (coming soon).
                </p>
              )}
            </div>
          ) : job.status === "OPEN" ? (
            <ApplyForm jobId={job.id} defaultName={me!.displayName} defaultLocation={me!.location} />
          ) : (
            <p className="rounded-2xl bg-neutral-100 p-5 text-neutral-600 dark:bg-white/5 dark:text-neutral-400">
              This job is no longer open for applications.
            </p>
          )}
        </div>
      </div>

      {isPoster && (
        <section className="mt-12">
          <h2 className="text-xl font-bold">Applications ({applications.length})</h2>
          {applications.length === 0 && (
            <p className="mt-3 text-neutral-500 dark:text-neutral-400">
              No applications yet. Freelancers will see this job on Find Work.
            </p>
          )}
          <ul className="mt-4 space-y-4">
            {applications.map((a) => (
              <li key={a.id} className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800 dark:bg-white/5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{a.applicantName || a.applicant.displayName}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {a.applicantLocation && <>{a.applicantLocation} · </>}
                      {a.applicant.publicUserId} · {formatKESRate(a.applicant.hourlyRate)} ·{" "}
                      {a.applicant.skills || "no skills listed"}
                    </p>
                  </div>
                  <ApplicantActions applicationId={a.id} status={a.status} />
                </div>
                <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">{a.coverNote}</p>
                {a.resume && (
                  <a
                    href={`/api/resume/${a.resume.id}`}
                    target="_blank"
                    className="mt-3 inline-block text-sm font-semibold text-brand underline-offset-4 hover:underline dark:text-accent"
                  >
                    View resume (PDF): {a.resume.fileName}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
