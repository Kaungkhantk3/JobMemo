export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getRecentJobEmails } from "@/lib/gmail";
import { GmailStatusCard } from "@/components/gmail/gmail-status-card";
import { GmailEmailList } from "@/components/gmail/gmail-email-list";
import type { GmailMessage } from "@/types/gmail";

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export default async function GmailPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  const hasGmailScope = !!account?.scope?.split(/\s+/).includes(GMAIL_SCOPE);
  const hasAccessToken = !!account?.access_token;

  let emails: GmailMessage[] = [];
  let fetchError: string | undefined;

  if (hasGmailScope && hasAccessToken && account?.access_token) {
    try {
      emails = await getRecentJobEmails(account.access_token);
    } catch {
      fetchError = "Unable to fetch Gmail messages.";
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-linear-to-br from-zinc-50 to-white">
      <div className="hidden md:flex items-center border-b border-zinc-200/80 bg-white/70 px-6 py-3.5 backdrop-blur">
        <h1 className="text-[15px] font-medium text-zinc-900">Gmail Sync</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5 space-y-4">
        <GmailStatusCard
          user={session.user}
          account={account}
          hasAccessToken={hasAccessToken}
        />

        {hasAccessToken ? (
          <GmailEmailList
            emails={emails}
            syncedAtLabel="just now"
            errorMessage={fetchError}
          />
        ) : null}
      </div>
    </div>
  );
}
