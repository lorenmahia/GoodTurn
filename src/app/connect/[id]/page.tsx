import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { participantRole, CLOSED_THREAD_NOTICE } from "@/lib/connect";
import MessageComposer from "@/components/MessageComposer";
import ReviewForm from "@/components/ReviewForm";
import Stars from "@/components/Stars";
import { reviewDirection, overallRating, isRevealed, REVIEW_WINDOW_DAYS } from "@/lib/reviews";

export default async function ConnectThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/connect/${id}`);
  const uid = session.user.id;

  const connection = await prisma.connection.findUnique({
    where: { id },
    include: {
      job: { select: { id: true, title: true, status: true } },
      reviews: {
        select: { authorId: true, ratingA: true, ratingB: true, ratingC: true, comment: true, createdAt: true },
      },
      client: { select: { displayName: true } },
      freelancer: { select: { displayName: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { displayName: true } } },
      },
    },
  });

  // notFound() (404), not a 403: never confirm the thread exists to outsiders.
  if (!connection || participantRole(connection, uid) === null) notFound();

  const iAmClient = connection.clientId === uid;
  const other = iAmClient ? connection.freelancer.displayName : connection.client.displayName;
  const isActive = connection.status === "ACTIVE";
  const jobDone = connection.job.status === "COMPLETED";
  const myReview = connection.reviews.find((r) => r.authorId === uid) ?? null;
  const counterpart = connection.reviews.find((r) => r.authorId !== uid) ?? null;
  const direction = reviewDirection(connection, uid);
  const counterpartVisible =
    counterpart !== null &&
    isRevealed({ counterpartExists: myReview !== null, closedAt: connection.closedAt, now: new Date() });

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-8">
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div>
          <Link
            href={`/jobs/${connection.job.id}`}
            className="text-lg font-bold text-brand hover:underline dark:text-accent"
          >
            {connection.job.title}
          </Link>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            with {other} · {isActive ? "Active" : "Closed"}
          </p>
        </div>
        <Link href="/connect" className="text-sm text-neutral-500 hover:underline dark:text-neutral-400">
          All threads
        </Link>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-6">
        {connection.messages.length === 0 && (
          <p className="text-center text-sm text-neutral-400">No messages yet. Say hello.</p>
        )}
        {connection.messages.map((m) => {
          const mine = m.senderId === uid;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "bg-brand text-white"
                    : "bg-neutral-100 text-neutral-900 dark:bg-white/10 dark:text-neutral-100"
                }`}
              >
                {!mine && <p className="mb-0.5 text-[11px] font-semibold opacity-70">{m.sender.displayName}</p>}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isActive ? (
        <MessageComposer connectionId={connection.id} />
      ) : (
        <p className="rounded-xl bg-neutral-100 px-4 py-3 text-center text-sm text-neutral-600 dark:bg-white/5 dark:text-neutral-400">
          {CLOSED_THREAD_NOTICE}
        </p>
      )}

      {jobDone && direction && (
        <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <h2 className="text-lg font-bold">Reviews</h2>
          <div className="mt-3">
            {myReview ? (
              <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                <p className="text-sm font-semibold">Your review</p>
                <Stars value={overallRating(myReview)} />
                {myReview.comment && <p className="mt-1 text-sm">{myReview.comment}</p>}
              </div>
            ) : (
              <ReviewForm connectionId={connection.id} direction={direction} />
            )}
          </div>
          <div className="mt-3">
            {counterpartVisible ? (
              <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                <p className="text-sm font-semibold">{other}&apos;s review</p>
                <Stars value={overallRating(counterpart!)} />
                {counterpart!.comment && <p className="mt-1 text-sm">{counterpart!.comment}</p>}
              </div>
            ) : counterpart ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {other}&apos;s review stays hidden until you leave yours (or {REVIEW_WINDOW_DAYS} days pass).
              </p>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {other} hasn&apos;t left a review yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
