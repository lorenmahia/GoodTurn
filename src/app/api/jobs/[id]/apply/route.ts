import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { applySchema } from "@/lib/validation";
import { findContactInfo, CONTACT_BLOCK_MESSAGE } from "@/lib/moderation";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { name, location, coverNote, resumeId } = parsed.data;

  const contactHits = findContactInfo(`${name}\n${location}\n${coverNote}`);
  if (contactHits.length > 0) {
    return NextResponse.json(
      { error: { coverNote: [`${CONTACT_BLOCK_MESSAGE} (found: ${contactHits[0].match})`] } },
      { status: 400 }
    );
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.posterId === session.user.id) {
    return NextResponse.json({ error: "You cannot apply to your own job" }, { status: 403 });
  }
  if (job.status !== "OPEN") {
    return NextResponse.json({ error: "This job is no longer open for applications" }, { status: 400 });
  }

  if (resumeId) {
    const resume = await prisma.resume.findUnique({ where: { id: resumeId }, select: { ownerId: true } });
    if (!resume || resume.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Invalid resume" }, { status: 400 });
    }
  }

  try {
    const [application] = await prisma.$transaction([
      prisma.application.create({
        data: {
          jobId: id,
          applicantId: session.user.id,
          coverNote,
          applicantName: name,
          applicantLocation: location,
          resumeId: resumeId ?? null,
        },
      }),
      // Easy-Apply write-back: edited details become the new profile defaults.
      prisma.user.update({
        where: { id: session.user.id },
        data: { displayName: name, location },
      }),
    ]);
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 });
    }
    throw error;
  }
}
