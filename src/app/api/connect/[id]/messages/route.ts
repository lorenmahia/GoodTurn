import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { messageSchema } from "@/lib/validation";
import { canSendMessage, isParticipant } from "@/lib/connect";
import { findContactInfo, CONTACT_BLOCK_MESSAGE } from "@/lib/moderation";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const payload = await req.json().catch(() => null);
  const parsed = messageSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const connection = await prisma.connection.findUnique({ where: { id } });
  // 404 (not 403) for non-participants: never confirm the thread exists.
  if (!connection || !isParticipant(connection, session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canSendMessage(connection, session.user.id)) {
    return NextResponse.json({ error: "This thread is closed." }, { status: 400 });
  }

  const hits = findContactInfo(parsed.data.body);
  if (hits.length > 0) {
    return NextResponse.json(
      { error: { body: [`${CONTACT_BLOCK_MESSAGE} (found: ${hits[0].match})`] } },
      { status: 400 }
    );
  }

  const message = await prisma.message.create({
    data: { connectionId: id, senderId: session.user.id, body: parsed.data.body },
  });
  return NextResponse.json({ message }, { status: 201 });
}
