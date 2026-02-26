import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const mediaId = Number(body.mediaId);
  const delta = Number(body.delta); // +1 ou -1

  if (Number.isNaN(mediaId) || Number.isNaN(delta) || ![-1, 1].includes(delta)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.media.findUnique({
      where: { id: mediaId },
      select: { id: true, likes: true },
    });

    if (!current) return null;

    const baseLikes = Math.max(0, current.likes ?? 0);
    const nextLikes = Math.max(0, baseLikes + delta);

    return tx.media.update({
      where: { id: mediaId },
      data: { likes: nextLikes },
      select: { id: true, likes: true },
    });
  });

  if (!result) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  return NextResponse.json({ id: result.id, likes: result.likes });
}