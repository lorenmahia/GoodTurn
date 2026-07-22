import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const resume = await prisma.resume.findFirst({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, fileName: true },
  });
  return NextResponse.json({ resume });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a PDF file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Resume must be 2 MB or smaller" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  // Content-type lies are cheap; the magic bytes are the contract.
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return NextResponse.json({ error: "Resume must be a PDF" }, { status: 400 });
  }

  const rawName = (file.name || "resume.pdf").replace(/[^\w. -]/g, "_").slice(0, 100);

  const resume = await prisma.resume.create({
    data: { ownerId: session.user.id, fileName: rawName, data: bytes },
    select: { id: true, fileName: true },
  });
  return NextResponse.json({ resume }, { status: 201 });
}
