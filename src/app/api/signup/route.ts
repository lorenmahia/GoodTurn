import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { signupSchema } from "@/lib/validation";
import { generatePublicUserId } from "@/lib/ids";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: { email: ["This email is already registered"] } }, { status: 400 });
  }
  const user = await prisma.user.create({
    data: {
      email,
      displayName: parsed.data.displayName,
      passwordHash: await hash(parsed.data.password, 10),
      publicUserId: generatePublicUserId(),
    },
  });
  return NextResponse.json({ id: user.id }, { status: 201 });
}
