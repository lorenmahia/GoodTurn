import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jobReportSchema } from "@/lib/validation";
import { shouldAutoHide } from "@/lib/trust";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = jobReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id }, select: { posterId: true, hidden: true } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (job.posterId === session.user.id) {
    return NextResponse.json({ error: "You cannot report your own job" }, { status: 403 });
  }
  if (job.hidden) {
    return NextResponse.json({ ok: true, message: "This job is already under review" }, { status: 200 });
  }

  try {
    await prisma.jobReport.create({
      data: { jobId: id, reporterId: session.user.id, reason: parsed.data.reason, note: parsed.data.note ?? "" },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "You have already reported this job" }, { status: 409 });
    }
    throw error;
  }

  // Distinct reporters == report rows, because [jobId, reporterId] is unique.
  const count = await prisma.jobReport.count({ where: { jobId: id } });
  if (shouldAutoHide(count)) {
    await prisma.job.update({ where: { id }, data: { hidden: true } });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
