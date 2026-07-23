import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function ConnectListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/connect");
  const uid = session.user.id;

  const connections = await prisma.connection.findMany({
    where: { OR: [{ clientId: uid }, { freelancerId: uid }] },
    include: {
      job: { select: { title: true } },
      client: { select: { displayName: true } },
      freelancer: { select: { displayName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-brand dark:text-accent">Goodturn Connect</h1>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Message the other party for each job — safely, on Goodturn. Threads close automatically when the job is done.
      </p>

      {connections.length === 0 ? (
        <p className="mt-10 text-center text-neutral-500 dark:text-neutral-400">
          No conversations yet. A thread opens here when you accept an applicant or are accepted for a job.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {connections.map((c) => {
            const iAmClient = c.clientId === uid;
            const other = iAmClient ? c.freelancer.displayName : c.client.displayName;
            const otherRole = iAmClient ? "freelancer" : "client";
            const last = c.messages[0];
            return (
              <li key={c.id}>
                <Link
                  href={`/connect/${c.id}`}
                  className="block rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-brand dark:border-neutral-800 dark:bg-white/5 dark:hover:border-accent"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{c.job.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        c.status === "ACTIVE"
                          ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                          : "bg-neutral-200 text-neutral-600 dark:bg-white/10 dark:text-neutral-400"
                      }`}
                    >
                      {c.status === "ACTIVE" ? "Active" : "Closed"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    with {other} ({otherRole})
                  </p>
                  {last && (
                    <p className="mt-2 truncate text-sm text-neutral-600 dark:text-neutral-300">{last.body}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
