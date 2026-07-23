import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jobPatchSchema } from "@/lib/validation";

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = jobPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.posterId !== session.user.id) {
    return NextResponse.json({ error: "Only the job poster can update this job" }, { status: 403 });
  }
  if (job.status !== "IN_PROGRESS") {
    return NextResponse.json(
      { error: "Only a job that is in progress can be completed or cancelled" },
      { status: 400 }
    );
  }

  // Completing (or cancelling) a job severs the broker: every active
  // connection on the job closes immediately. Atomic so the thread can
  // never outlive the job.
  const [updated] = await prisma.$transaction([
    prisma.job.update({ where: { id }, data: { status: parsed.data.status } }),
    prisma.connection.updateMany({
      where: { jobId: id, status: "ACTIVE" },
      data: { status: "CLOSED", closedAt: new Date() },
    }),
    ...(parsed.data.status === "COMPLETED"
      ? [prisma.user.update({ where: { id: job.posterId }, data: { completedHires: { increment: 1 } } })]
      : []),
  ]);
  return NextResponse.json({ job: updated });
}
