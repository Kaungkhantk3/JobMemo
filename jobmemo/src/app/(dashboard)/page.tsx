export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createGmailClient,
  getRecentJobEmails,
  getSentApplicationEmails,
} from "@/lib/gmail";
import { ApplicationsTable } from "@/components/applications/applications-table";
import { GmailDashboardSection } from "@/components/gmail/gmail-dashboard-section";
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

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const googleAccounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  const account =
    googleAccounts.find(
      (entry) =>
        !!entry.access_token && entry.scope?.includes("gmail.readonly"),
    ) ??
    googleAccounts.find(
      (entry) =>
        !!entry.access_token &&
        entry.scope?.includes("https://www.googleapis.com/auth/gmail.readonly"),
    ) ??
    googleAccounts.find((entry) => entry.scope?.includes("gmail.readonly")) ??
    googleAccounts.find((entry) =>
      entry.scope?.includes("https://www.googleapis.com/auth/gmail.readonly"),
    ) ??
    googleAccounts[0] ??
    null;

  let inboxEmails: GmailMessage[] = [];
  let sentEmails: GmailMessage[] = [];
  let inboxError: string | undefined;
  let sentError: string | undefined;

  const reviewRows = await prisma.gmailEmailReview.findMany({
    where: {
      userId: session.user.id,
    },
  });

  if (account?.access_token) {
    const gmail = createGmailClient(
      account.access_token,
      account.refresh_token,
    );

    try {
      await gmail.users.getProfile({ userId: "me" });
    } catch {
      inboxError =
        "Connect Gmail from the Gmail Sync page to load job emails here.";
      sentError = inboxError;
    }

    if (!inboxError) {
      try {
        inboxEmails = (await getRecentJobEmails(
          account.access_token,
          account.refresh_token,
          "INBOX_ACTIVITY",
        )) as GmailMessage[];
      } catch {
        inboxError =
          "Connect Gmail from the Gmail Sync page to load job emails here.";
      }
    }

    if (!sentError) {
      try {
        sentEmails = (await getSentApplicationEmails(
          account.access_token,
          account.refresh_token,
        )) as GmailMessage[];
      } catch {
        sentError =
          "Connect Gmail from the Gmail Sync page to load job emails here.";
      }
    }
  } else {
    inboxError =
      "Connect Gmail from the Gmail Sync page to load job emails here.";
    sentError = inboxError;
  }

  inboxEmails = mergeEmailReviews(inboxEmails, reviewRows);
  sentEmails = mergeEmailReviews(sentEmails, reviewRows);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-linear-to-br from-zinc-50 to-white">
      <div className="hidden md:flex items-center border-b border-zinc-200/80 bg-white/70 px-6 py-3.5 backdrop-blur">
        <h1 className="text-[15px] font-medium text-zinc-900">Dashboard</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5">
        <div className="space-y-4">
          <GmailDashboardSection
            inboxEmails={inboxEmails}
            sentEmails={sentEmails}
            inboxError={inboxError}
            sentError={sentError}
            syncedAtLabel="just now"
          />

          <ApplicationsTable
            applications={JSON.parse(JSON.stringify(applications))}
          />
        </div>
      </div>
    </div>
  );
}
