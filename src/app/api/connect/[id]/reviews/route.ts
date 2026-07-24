import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { reviewSchema } from "@/lib/validation";
import { isParticipant } from "@/lib/connect";
import { reviewDirection, subjectFor } from "@/lib/reviews";
import { findContactInfo, CONTACT_BLOCK_MESSAGE } from "@/lib/moderation";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const payload = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const connection = await prisma.connection.findUnique({
    where: { id },
    include: { job: { select: { status: true } } },
  });
  // 404 (not 403) for non-participants: never confirm the thread exists.
  if (!connection || !isParticipant(connection, session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (connection.job.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "You can review only after the job is completed." },
      { status: 400 }
    );
  }

  const comment = parsed.data.comment ?? "";
  const hits = findContactInfo(comment);
  if (hits.length > 0) {
    return NextResponse.json(
      { error: { comment: [`${CONTACT_BLOCK_MESSAGE} (found: ${hits[0].match})`] } },
      { status: 400 }
    );
  }

  // Direction and subject are derived server-side from the connection —
  // never trusted from the client.
  const direction = reviewDirection(connection, session.user.id)!;
  const subjectId = subjectFor(connection, session.user.id)!;

  try {
    const review = await prisma.review.create({
      data: {
        connectionId: id,
        authorId: session.user.id,
        subjectId,
        direction,
        ratingA: parsed.data.ratingA,
        ratingB: parsed.data.ratingB,
        ratingC: parsed.data.ratingC,
        comment,
      },
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "You already reviewed this job." }, { status: 409 });
    }
    throw error;
  }
}
