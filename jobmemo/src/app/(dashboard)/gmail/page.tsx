export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GmailStatusCard } from "@/components/gmail/gmail-status-card";

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
    googleAccounts.find((entry) =>
      entry.scope?.includes("https://www.googleapis.com/auth/gmail.readonly"),
    ) ??
    googleAccounts[0] ??
    null;

  const hasAccessToken = !!account?.access_token;

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

        <section className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-sm md:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Reconnect only
          </p>
          <p className="mt-3 text-[15px] leading-6 text-zinc-600">
            Use this page to reconnect Gmail if access expires. Your job emails
            and stats now live on the Dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}
