import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jobCreateSchema, jobQuerySchema } from "@/lib/validation";
import { searchJobs } from "@/lib/jobs";

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

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) {
    return NextResponse.json({ error: { categoryId: ["Unknown category"] } }, { status: 400 });
  }

  const { estimatedHours } = parsed.data;
  const price = parsed.data.paymentType === "FIXED"
    ? parsed.data.price
    : Math.round(parsed.data.hourlyRate * estimatedHours * 100) / 100;

  const job = await prisma.job.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      estimatedHours,
      price,
      paymentType: parsed.data.paymentType,
      hourlyRate: parsed.data.paymentType === "HOURLY" ? parsed.data.hourlyRate : null,
      posterId: session.user.id,
    },
  });
  return NextResponse.json({ job }, { status: 201 });
}
