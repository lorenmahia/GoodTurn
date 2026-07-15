import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const job = await prisma.job.findUnique({
    where: { id },
    include: { category: true, poster: { select: { id: true, displayName: true } } },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session?.user?.id === job.posterId) {
    const applications = await prisma.application.findMany({
      where: { jobId: id },
      include: {
        applicant: { select: { displayName: true, skills: true, hourlyRate: true, publicUserId: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ job, applications });
  }
  return NextResponse.json({ job });
}
