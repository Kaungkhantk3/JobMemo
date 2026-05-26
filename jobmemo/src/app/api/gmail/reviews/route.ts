import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google",
      },
      select: {
        id: true,
        provider: true,
        scope: true,
        access_token: true,
        refresh_token: true,
      },
    });

    const lastReview = await prisma.gmailEmailReview.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        syncedAt: "desc",
      },
      select: {
        syncedAt: true,
      },
    });

    const reviewCount = await prisma.gmailEmailReview.count({
      where: {
        userId: session.user.id,
      },
    });

    const lastSyncAt = lastReview?.syncedAt?.toISOString() ?? null;
    const lastSyncMinutes = lastReview?.syncedAt
      ? Math.floor((Date.now() - lastReview.syncedAt.getTime()) / 60000)
      : null;

    return NextResponse.json({
      canSync: !!account && (!!account.access_token || !!account.refresh_token),
      reviewCount,
      lastSyncAt,
      shouldAutoSync: lastSyncMinutes === null ? true : lastSyncMinutes >= 10,
      lastSyncAtLabel:
        lastSyncAt === null
          ? "Never synced"
          : lastSyncMinutes === null || lastSyncMinutes < 1
            ? "just now"
            : lastSyncMinutes === 1
              ? "1 minute ago"
              : `${lastSyncMinutes} minutes ago`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load Gmail review cache" },
      { status: 500 },
    );
  }
}
