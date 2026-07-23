import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { applicationPatchSchema } from "@/lib/validation";
import { canTransition, type ApplicationStatus } from "@/lib/rules";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = applicationPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const application = await prisma.application.findUnique({ where: { id }, include: { job: true } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.job.posterId !== session.user.id) {
    return NextResponse.json({ error: "Only the job poster can manage applications" }, { status: 403 });
  }

  const from = application.status as ApplicationStatus;
  const to = parsed.data.status;
  if (!canTransition(from, to)) {
    return NextResponse.json({ error: `Cannot change application from ${from} to ${to}` }, { status: 400 });
  }

  const [updated] = await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { status: to } }),
    ...(to === "ACCEPTED"
      ? [
          prisma.job.update({ where: { id: application.jobId }, data: { status: "IN_PROGRESS" } }),
          prisma.connection.create({
            data: {
              jobId: application.jobId,
              applicationId: application.id,
              clientId: application.job.posterId,
              freelancerId: application.applicantId,
            },
          }),
        ]
      : []),
  ]);
  return NextResponse.json({ application: updated });
}
