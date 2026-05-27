import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const suggestions = await prisma.gmailEmailReview.findMany({
      where: {
        userId: session.user.id,
        hidden: false,
        applicationId: null,
      },
      orderBy: {
        syncedAt: "desc",
      },
      select: {
        gmailMessageId: true,
        threadId: true,
        company: true,
        role: true,
        status: true,
        confidence: true,
        hidden: true,
        userCorrectedStatus: true,
        reviewed: true,
        source: true,
        syncedAt: true,
        notes: true,
      },
    });

    return NextResponse.json({
      suggestions: suggestions.map((suggestion) => ({
        id: suggestion.gmailMessageId,
        threadId: suggestion.threadId,
        company: suggestion.company,
        position: suggestion.role,
        status: suggestion.status,
        confidence: suggestion.confidence,
        hidden: suggestion.hidden,
        userCorrectedStatus: suggestion.userCorrectedStatus,
        reviewed: suggestion.reviewed,
        source: suggestion.source,
        syncedAt: suggestion.syncedAt?.toISOString() ?? null,
        notes: suggestion.notes,
      })),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to load Gmail suggestions" },
      { status: 500 },
    );
  }
}
