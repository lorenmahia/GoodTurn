import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { jobCreateSchema, jobQuerySchema } from "@/lib/validation";
import { isPriceAllowed, minimumPrice } from "@/lib/rules";
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

  const { price, estimatedHours } = parsed.data;
  if (!isPriceAllowed(price, category.typicalHourlyRate, estimatedHours)) {
    const min = minimumPrice(category.typicalHourlyRate, estimatedHours);
    return NextResponse.json(
      { error: { price: [`The minimum for ${category.name} at ${estimatedHours} hours is $${min}`] } },
      { status: 400 }
    );
  }

  const job = await prisma.job.create({ data: { ...parsed.data, posterId: session.user.id } });
  return NextResponse.json({ job }, { status: 201 });
}
