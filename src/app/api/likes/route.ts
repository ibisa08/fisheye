import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const mediaId = Number(body.mediaId);
  const delta = Number(body.delta); // +1 ou -1

  if (Number.isNaN(mediaId) || Number.isNaN(delta) || ![-1, 1].includes(delta)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Transaction: read current likes, clamp, then update
  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const current = await tx.media.findUnique({
      where: { id: mediaId },
      select: { id: true, likes: true },
    });

    if (!current) return null;

    // clamp current likes (in case DB contains negative)
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