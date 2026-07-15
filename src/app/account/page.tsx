import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import BalanceCard from "@/components/BalanceCard";
import ComingSoon from "@/components/ComingSoon";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  const myApplications = await prisma.application.findMany({
    where: { applicantId: user.id },
    include: { job: { select: { id: true, title: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
  const jobsPosted = await prisma.job.findMany({
    where: { posterId: user.id },
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="rounded-3xl border border-neutral-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-brand">User ID: {user.publicUserId}</h1>
            <p className="mt-1 max-w-sm text-sm font-medium text-neutral-700">
              This is the ID you will be asked for when trying to connect with Job Owners on our Goodturn
              Connect Platform.
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <BalanceCard balance={user.accountBalance} />
            <ComingSoon
              label="Withdraw"
              note="Payments launch soon — withdrawals will be available then."
              className="rounded bg-ink px-6 py-2.5 font-medium text-white hover:bg-neutral-700"
            />
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-brand p-8 text-white">
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <h3 className="mt-4 text-lg">Your Payment Info</h3>
        <p className="mt-4 text-neutral-200">View Current Payment Information</p>
        <p className="mt-2 text-neutral-200">Manage Payment Method</p>
        <p className="mt-4 rounded bg-white/10 px-4 py-3 text-sm">
          Payments launch soon. You&apos;ll be able to link Visa, Mastercard, PayPal, Mpesa and Crypto Wallets here.
        </p>
      </section>

      <section id="my-applications" className="mt-10">
        <h2 className="text-xl font-bold">My Job Applications</h2>
        {myApplications.length === 0 ? (
          <p className="mt-3 text-neutral-500">
            You haven&apos;t applied to any jobs yet. <Link href="/find-work" className="text-brand underline">Find work</Link>.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {myApplications.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-4 py-3">
                <Link href={`/jobs/${a.job.id}`} className="font-medium text-brand hover:underline">{a.job.title}</Link>
                <span className="text-sm font-semibold text-neutral-600">{a.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="jobs-posted" className="mt-10">
        <h2 className="text-xl font-bold">Jobs I Posted</h2>
        {jobsPosted.length === 0 ? (
          <p className="mt-3 text-neutral-500">
            You haven&apos;t posted any jobs yet. <Link href="/post-a-job" className="text-brand underline">Post a job</Link>.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {jobsPosted.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-4 py-3">
                <Link href={`/jobs/${j.id}`} className="font-medium text-brand hover:underline">{j.title}</Link>
                <span className="text-sm text-neutral-600">
                  {j._count.applications} application{j._count.applications === 1 ? "" : "s"} · {j.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10">
        <Link href="/profile" className="font-medium text-brand underline">Edit my profile →</Link>
      </p>
    </div>
  );
}
