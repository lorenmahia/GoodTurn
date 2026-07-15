import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { rankJobs } from "@/lib/match";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const jobs = await prisma.job.findMany({
    where: { status: "OPEN", NOT: { posterId: user.id } },
    include: { category: true, poster: { select: { displayName: true } } },
  });
  const ranked = rankJobs(
    user.skills,
    jobs.map((j) => ({ ...j, categoryName: j.category.name }))
  );
  return NextResponse.json({ jobs: ranked });
}
