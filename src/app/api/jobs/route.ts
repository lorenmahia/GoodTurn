import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jobCreateSchema, jobQuerySchema } from "@/lib/validation";
import { findContactInfo, CONTACT_BLOCK_MESSAGE } from "@/lib/moderation";
import { searchJobs } from "@/lib/jobs";

const DUPLICATE_WINDOW_MS = 30_000;

export async function GET(req: Request) {
  const raw = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = jobQuerySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  return NextResponse.json({ jobs: await searchJobs(parsed.data) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = jobCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { title, description, categoryId, estimatedHours } = parsed.data;

  const contactHits = findContactInfo(`${title}\n${description}`);
  if (contactHits.length > 0) {
    return NextResponse.json(
      { error: { description: [`${CONTACT_BLOCK_MESSAGE} (found: ${contactHits[0].match})`] } },
      { status: 400 }
    );
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return NextResponse.json({ error: { categoryId: ["Unknown category"] } }, { status: 400 });
  }

  // Double-submit idempotency: an identical job from the same poster inside
  // the window is the same click, not a new job.
  const duplicate = await prisma.job.findFirst({
    where: { posterId: session.user.id, title, description, createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) } },
  });
  if (duplicate) return NextResponse.json({ job: duplicate }, { status: 200 });

  const price =
    parsed.data.paymentType === "FIXED"
      ? parsed.data.price
      : Math.round(parsed.data.hourlyRate * estimatedHours * 100) / 100;

  const job = await prisma.job.create({
    data: {
      title,
      description,
      categoryId,
      estimatedHours,
      price,
      paymentType: parsed.data.paymentType,
      hourlyRate: parsed.data.paymentType === "HOURLY" ? parsed.data.hourlyRate : null,
      posterId: session.user.id,
    },
  });
  return NextResponse.json({ job }, { status: 201 });
}
