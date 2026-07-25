import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getReputation } from "@/lib/reputation";
import JobSuccessScore from "@/components/JobSuccessScore";
import ReviewList from "@/components/ReviewList";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ publicUserId: string }>;
}) {
  const { publicUserId } = await params;
  const user = await prisma.user.findUnique({
    where: { publicUserId },
    select: { id: true, displayName: true, location: true, skills: true, completedHires: true },
  });
  if (!user) notFound();

  const rep = await getReputation(user.id);
  const hasReviews = rep.asFreelancer.count > 0 || rep.asClient.count > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-brand dark:text-accent">{user.displayName}</h1>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
        {user.location || "Kenya"} · {user.completedHires} completed hire
        {user.completedHires === 1 ? "" : "s"}
      </p>
      {user.skills && <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{user.skills}</p>}

      {rep.asFreelancer.count > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-bold">As a freelancer</h2>
          <JobSuccessScore
            direction={rep.asFreelancer.direction}
            score={rep.asFreelancer.score}
            count={rep.asFreelancer.count}
            breakdown={rep.asFreelancer.breakdown}
          />
          <ReviewList reviews={rep.asFreelancer.reviews} />
        </section>
      )}

      {rep.asClient.count > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-bold">As a client</h2>
          <JobSuccessScore
            direction={rep.asClient.direction}
            score={rep.asClient.score}
            count={rep.asClient.count}
            breakdown={rep.asClient.breakdown}
          />
          <ReviewList reviews={rep.asClient.reviews} />
        </section>
      )}

      {!hasReviews && (
        <p className="mt-8 text-neutral-500 dark:text-neutral-400">No reviews yet.</p>
      )}
    </div>
  );
}
