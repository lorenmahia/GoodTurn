import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = resume.ownerId === session.user.id;
  const isReviewingPoster =
    !isOwner &&
    (await prisma.application.findFirst({
      where: { resumeId: id, job: { posterId: session.user.id } },
      select: { id: true },
    })) !== null;

  if (!isOwner && !isReviewingPoster) {
    // 404, not 403: don't confirm the resume exists to the unauthorized.
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const safeName = resume.fileName.replace(/[^\w. -]/g, "_");
  return new NextResponse(Buffer.from(resume.data), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
