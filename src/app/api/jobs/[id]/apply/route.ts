import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { applySchema } from "@/lib/validation";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.posterId === session.user.id) {
    return NextResponse.json({ error: "You cannot apply to your own job" }, { status: 403 });
  }
  if (job.status !== "OPEN") {
    return NextResponse.json({ error: "This job is no longer open for applications" }, { status: 400 });
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_applicantId: { jobId: id, applicantId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: { jobId: id, applicantId: session.user.id, coverNote: parsed.data.coverNote },
  });
  return NextResponse.json({ application }, { status: 201 });
}
