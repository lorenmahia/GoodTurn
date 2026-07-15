import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
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
  const myApplication = isPoster
    ? null
    : await prisma.application.findUnique({
        where: { jobId_applicantId: { jobId: id, applicantId: session.user.id } },
      });
  const applications = isPoster
    ? await prisma.application.findMany({
        where: { jobId: id },
        include: { applicant: { select: { displayName: true, skills: true, hourlyRate: true, publicUserId: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand">{job.title}</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {job.category.name} · ~{job.estimatedHours}h · posted by {job.poster.displayName}
          </p>
        </div>
        <div className="text-right">
          <p className="rounded bg-ink px-4 py-2 text-xl font-bold text-white">${job.price}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{job.status.replace("_", " ")}</p>
        </div>
      </div>

      <p className="mt-8 whitespace-pre-line leading-relaxed text-neutral-800">{job.description}</p>

      <div className="mt-10">
        {isPoster ? (
          <section>
            <h2 className="text-xl font-bold">Applications ({applications.length})</h2>
            {applications.length === 0 && (
              <p className="mt-3 text-neutral-500">No applications yet. Freelancers will see this job on Find Work.</p>
            )}
            <ul className="mt-4 space-y-4">
              {applications.map((a) => (
                <li key={a.id} className="rounded-xl border border-neutral-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{a.applicant.displayName}</p>
                      <p className="text-xs text-neutral-500">
                        {a.applicant.publicUserId} · ${a.applicant.hourlyRate}/h · {a.applicant.skills || "no skills listed"}
                      </p>
                    </div>
                    <ApplicantActions applicationId={a.id} status={a.status} />
                  </div>
                  <p className="mt-3 text-sm text-neutral-700">{a.coverNote}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : myApplication ? (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="font-medium">
              You applied on {myApplication.createdAt.toLocaleDateString()} — status:{" "}
              <span className="font-bold text-brand">{myApplication.status}</span>
            </p>
            {myApplication.status === "ACCEPTED" && (
              <p className="mt-2 text-sm text-neutral-600">
                Congratulations! You&apos;ll coordinate the work through Goodturn Connect (coming soon).
              </p>
            )}
          </div>
        ) : job.status === "OPEN" ? (
          <ApplyForm jobId={job.id} />
        ) : (
          <p className="rounded-xl bg-neutral-100 p-5 text-neutral-600">This job is no longer open for applications.</p>
        )}
      </div>
    </div>
  );
}
