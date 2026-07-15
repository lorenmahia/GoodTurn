import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { profilePatchSchema } from "@/lib/validation";

const PUBLIC_FIELDS = {
  id: true,
  email: true,
  displayName: true,
  bio: true,
  skills: true,
  hourlyRate: true,
  accountBalance: true,
  publicUserId: true,
  createdAt: true,
} as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: PUBLIC_FIELDS });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = profilePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: PUBLIC_FIELDS,
  });
  return NextResponse.json({ user });
}
