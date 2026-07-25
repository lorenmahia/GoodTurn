import { prisma } from "@/lib/db";
import { isRevealed, jobSuccessScore, type Direction } from "@/lib/reviews";

export type RevealedReview = {
  direction: Direction;
  ratingA: number;
  ratingB: number;
  ratingC: number;
  comment: string;
  createdAt: Date;
  jobTitle: string;
  authorName: string;
};

export type ReputationView = {
  direction: Direction;
  score: number | null;
  count: number;
  breakdown: { a: number; b: number; c: number } | null;
  reviews: RevealedReview[];
};

export type Reputation = {
  asFreelancer: ReputationView; // reviews about them as the freelancer (CLIENT_ON_FREELANCER)
  asClient: ReputationView; // reviews about them as the client (FREELANCER_ON_CLIENT)
};

export async function getReputation(userId: string): Promise<Reputation> {
  const now = new Date();
  const rows = await prisma.review.findMany({
    where: { subjectId: userId },
    include: {
      author: { select: { displayName: true } },
      connection: {
        select: {
          closedAt: true,
          job: { select: { title: true } },
          _count: { select: { reviews: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // A connection holds at most two reviews (one per author, @@unique), so a
  // review count of 2 means the counterpart exists.
  const revealed = rows.filter((r) =>
    isRevealed({
      counterpartExists: r.connection._count.reviews >= 2,
      closedAt: r.connection.closedAt,
      now,
    })
  );

  const build = (direction: Direction): ReputationView => {
    const subset = revealed.filter((r) => r.direction === direction);
    const agg = jobSuccessScore(
      subset.map((r) => ({ ratingA: r.ratingA, ratingB: r.ratingB, ratingC: r.ratingC }))
    );
    return {
      direction,
      score: agg.score,
      count: agg.count,
      breakdown: agg.breakdown,
      reviews: subset.map((r) => ({
        direction: r.direction as Direction,
        ratingA: r.ratingA,
        ratingB: r.ratingB,
        ratingC: r.ratingC,
        comment: r.comment,
        createdAt: r.createdAt,
        jobTitle: r.connection.job.title,
        authorName: r.author.displayName,
      })),
    };
  };

  return {
    asFreelancer: build("CLIENT_ON_FREELANCER"),
    asClient: build("FREELANCER_ON_CLIENT"),
  };
}
