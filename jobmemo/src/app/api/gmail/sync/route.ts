import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  createGmailClient,
  getRecentJobEmails,
  getSentApplicationEmails,
} from "@/lib/gmail";
import { prisma } from "@/lib/prisma";
import type { GmailMessage } from "@/types/gmail";

function mergeEmailReviews(
  emails: GmailMessage[],
  reviews: Array<{
    gmailMessageId: string;
    hidden: boolean;
    reviewed: boolean;
    userCorrectedStatus: string | null;
  }>,
) {
  const reviewsById = new Map(
    reviews.map((review) => [review.gmailMessageId, review]),
  );

  return emails.map((email) => {
    const review = reviewsById.get(email.id);

    if (!review) {
      return email;
    }

    return {
      ...email,
      hidden: review.hidden,
      reviewed: review.reviewed,
      userCorrectedStatus:
        review.userCorrectedStatus as GmailMessage["userCorrectedStatus"],
    };
  });
}

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
        scope: true,
        provider: true,
        access_token: true,
        refresh_token: true,
      },
    });

    if (!account?.access_token && !account?.refresh_token) {
      return NextResponse.json(
        { error: "Gmail account not connected" },
        { status: 404 },
      );
    }

    const gmail = createGmailClient(
      account.access_token,
      account.refresh_token,
    );

    const syncWork = async () => {
      await gmail.users.getProfile({ userId: "me" });

      const existingReviews = await prisma.gmailEmailReview.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          gmailMessageId: true,
        },
      });

      const skippedIdsKey = existingReviews
        .map((review) => review.gmailMessageId)
        .join(",");

      const [inboxEmails, sentEmails, reviewRows] = await Promise.all([
        getRecentJobEmails(
          account.access_token,
          account.refresh_token,
          "INBOX_ACTIVITY",
          15,
          skippedIdsKey,
        ),
        getSentApplicationEmails(
          account.access_token,
          account.refresh_token,
          15,
          skippedIdsKey,
        ),
        prisma.gmailEmailReview.findMany({
          where: {
            userId: session.user.id,
          },
          select: {
            gmailMessageId: true,
            hidden: true,
            reviewed: true,
            userCorrectedStatus: true,
          },
        }),
      ]);

      return {
        inboxEmails: mergeEmailReviews(inboxEmails, reviewRows),
        sentEmails: mergeEmailReviews(sentEmails, reviewRows),
        inboxError: undefined,
        sentError: undefined,
        syncedAtLabel: "just now",
      };
    };

    const timeoutMs = 9000;
    const timeoutPromise = new Promise<{ timedOut: true }>((resolve) => {
      setTimeout(() => resolve({ timedOut: true }), timeoutMs);
    });

    const result = await Promise.race([syncWork(), timeoutPromise]);

    if ("timedOut" in result) {
      return NextResponse.json({
        inboxEmails: [],
        sentEmails: [],
        inboxError: "Sync is still running. Try again in a moment.",
        sentError: "Sync is still running. Try again in a moment.",
        syncedAtLabel: "just now",
        timedOut: true,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to sync Gmail messages",
      },
      { status: 500 },
    );
  }
}
