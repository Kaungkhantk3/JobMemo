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

  const googleAccounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  const account =
    googleAccounts.find((entry) => entry.scope?.includes("gmail.readonly")) ??
    googleAccounts.find((entry) => entry.scope?.includes(GMAIL_SCOPE)) ??
    googleAccounts[0] ??
    null;

  const hasGmailScope =
    !!account?.scope?.includes("gmail.readonly") ||
    !!account?.scope?.includes(GMAIL_SCOPE);
  const hasAccessToken = !!account?.access_token;
  const hasRefreshToken = !!account?.refresh_token;
  const canFetchEmails = hasGmailScope && hasAccessToken;

  console.log("Gmail account debug", {
    accountCount: googleAccounts.length,
    provider: account?.provider,
    scope: account?.scope ?? "none",
    hasAccessToken,
    hasRefreshToken,
  });

  let emails: GmailMessage[] = [];
  let fetchError: string | undefined;

  if (canFetchEmails && account?.access_token) {
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

        {process.env.NODE_ENV !== "production" ? (
          <section className="overflow-hidden rounded-3xl border border-dashed border-zinc-200/80 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                Gmail debug
              </p>
              <p className="text-[11px] font-medium text-zinc-500">
                Development only
              </p>
            </div>
            <div className="mt-3 grid gap-2 text-[13px] text-zinc-700 md:grid-cols-2">
              <DebugLine label="Provider" value={account?.provider ?? "none"} />
              <DebugLine
                label="Scope stored"
                value={account?.scope ?? "none"}
              />
              <DebugLine
                label="Has access token"
                value={hasAccessToken ? "yes" : "no"}
              />
              <DebugLine
                label="Has refresh token"
                value={hasRefreshToken ? "yes" : "no"}
              />
            </div>
          </section>
        ) : null}

        {canFetchEmails ? (
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

function DebugLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 break-all text-[13px] text-zinc-700">{value}</p>
    </div>
  );
}
