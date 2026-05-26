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

    await gmail.users.getProfile({ userId: "me" });

    const [inboxEmails, sentEmails, reviewRows] = await Promise.all([
      getRecentJobEmails(
        account.access_token,
        account.refresh_token,
        "INBOX_ACTIVITY",
      ),
      getSentApplicationEmails(account.access_token, account.refresh_token),
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

    return NextResponse.json({
      inboxEmails: mergeEmailReviews(inboxEmails, reviewRows),
      sentEmails: mergeEmailReviews(sentEmails, reviewRows),
      inboxError: undefined,
      sentError: undefined,
      syncedAtLabel: "just now",
    });
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
