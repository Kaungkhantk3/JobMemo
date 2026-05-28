import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { jsonError } from "@/lib/api";
import { getRecentJobEmails, getSentApplicationEmails } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";

function sortByDateDescending<
  T extends { date?: string | null; syncedAt?: string | null },
>(entries: T[]) {
  return entries.sort((left, right) => {
    const leftDate = new Date(left.date ?? left.syncedAt ?? 0).getTime();
    const rightDate = new Date(right.date ?? right.syncedAt ?? 0).getTime();

    return rightDate - leftDate;
  });
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return jsonError("Unauthorized", 401);
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google",
      },
      select: {
        access_token: true,
        refresh_token: true,
      },
    });

    if (!account?.access_token && !account?.refresh_token) {
      return jsonError("Gmail account not connected", 404);
    }

    const limit = new URL(request.url).searchParams.get("limit");
    const safeLimit = Math.min(Math.max(Number(limit ?? "8") || 8, 1), 10);

    const reviewRows = await prisma.gmailEmailReview.findMany({
      where: {
        userId: session.user.id,
        OR: [{ hidden: false, applicationId: null }, { reviewed: false }],
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
        applicationId: true,
      },
    });

    const existingReviewIds = reviewRows
      .filter((review) => review.hidden || review.applicationId)
      .map((review) => review.gmailMessageId);

    const skippedMessageIdsKey = existingReviewIds.join(",");

    const [inboxEmails, sentEmails] = await Promise.all([
      getRecentJobEmails(
        account.access_token,
        account.refresh_token,
        "INBOX_ACTIVITY",
        safeLimit,
        skippedMessageIdsKey,
      ),
      getSentApplicationEmails(
        account.access_token,
        account.refresh_token,
        safeLimit,
        skippedMessageIdsKey,
      ),
    ]);

    const reviewsById = new Map(
      reviewRows.map((review) => [review.gmailMessageId, review]),
    );

    const suggestions = sortByDateDescending(
      [...inboxEmails, ...sentEmails]
        .filter((message) => !reviewsById.get(message.id)?.hidden)
        .map((message) => {
          const review = reviewsById.get(message.id);

          console.info("[gmail-suggestions]", {
            subject: message.subject,
            from: message.from,
            extractedCompany: message.company,
            extractedRole: message.role,
            snippet: message.snippet,
          });

          return {
            id: message.id,
            threadId: message.threadId,
            company: review?.company ?? message.company,
            position: review?.role ?? message.role,
            subject: message.subject,
            snippet: message.snippet,
            from: message.from,
            date: message.date,
            status: review?.status ?? message.status,
            confidence: review?.confidence ?? message.confidence,
            hidden: review?.hidden ?? message.hidden,
            userCorrectedStatus:
              review?.userCorrectedStatus ?? message.userCorrectedStatus,
            reviewed: review?.reviewed ?? message.reviewed,
            source: review?.source ?? message.source,
            syncedAt: review?.syncedAt?.toISOString() ?? message.syncedAt,
            notes: review?.notes ?? message.notes,
          };
        })
        .slice(0, safeLimit),
    );

    return NextResponse.json(
      { suggestions },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
        },
      },
    );
  } catch (error) {
    console.error(error);

    return jsonError("Failed to load Gmail suggestions", 500);
  }
}
