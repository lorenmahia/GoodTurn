import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getReputation } from "@/lib/reputation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      displayName: true,
      publicUserId: true,
      location: true,
      skills: true,
      completedHires: true,
    },
  });
  const reputation = await getReputation(session.user.id);

  const payload = {
    exportedAt: new Date().toISOString(),
    platform: "Goodturn",
    profile: user,
    reputation,
  };

  // A file the user keeps — reputation no ban or shutdown can erase.
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="goodturn-reputation.json"',
    },
  });
}
