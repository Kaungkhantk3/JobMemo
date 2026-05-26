import { CheckCircle2, Mail, ShieldCheck, UserCircle2 } from "lucide-react";

import { ConnectGmailButton } from "./connect-gmail-button";
import { DisconnectGmailButton } from "./disconnect-gmail-button";

type GmailUser = {
  name?: string | null;
  email?: string | null;
};

type GmailAccount = {
  scope?: string | null;
  provider?: string;
  providerAccountId?: string;
} | null;

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

function hasGmailScope(scope?: string | null) {
  return !!scope?.includes("gmail.readonly") || !!scope?.includes(GMAIL_SCOPE);
}

export function GmailStatusCard({
  user,
  account,
  gmailVerified = false,
}: {
  user: GmailUser;
  account: GmailAccount;
  gmailVerified?: boolean;
}) {
  const gmailConnected = gmailVerified || hasGmailScope(account?.scope);
  const googleConnected = !!account;
  const needsReconnect = googleConnected && !gmailConnected;

  const heading = gmailConnected
    ? "Gmail Connected"
    : needsReconnect
      ? "Reconnect Gmail"
      : "Connect Gmail";

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="border-b border-zinc-200/80 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gmail foundation
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
              Prepare JobMemo to sync Gmail later.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
              Connect Gmail access now so JobMemo can read job-related mail in a
              later phase without changing your current workflow.
            </p>
          </div>

          <div className="hidden rounded-2xl bg-zinc-900 p-3 text-white md:block">
            <Mail className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-700 shadow-sm">
              Gmail Read-only
            </span>
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-700 shadow-sm">
              Can read messages
            </span>
            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium text-zinc-700 shadow-sm">
              Cannot send or delete emails
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 transition-shadow hover:shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-zinc-700 shadow-sm">
                <UserCircle2 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Connected Google account
                </p>
                <p className="mt-1 truncate text-[15px] font-medium text-zinc-950">
                  {user.name ?? "Signed in user"}
                </p>
                <p className="truncate text-[13px] text-zinc-500">
                  {user.email ?? "No email available"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <StatusPill
              label="Google account"
              value={googleConnected ? "Linked" : "Not linked"}
              active={googleConnected}
            />
            <StatusPill
              label="Gmail scope"
              value={gmailConnected ? "Granted" : "Not granted"}
              active={gmailConnected}
            />
          </div>

          <p className="text-[13px] leading-6 text-zinc-500">
            JobMemo verifies Gmail access server-side before loading recent
            messages.
          </p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Connection status
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-950">
              {heading}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-zinc-500">
              {gmailConnected
                ? "Gmail read access is already enabled for this account."
                : needsReconnect
                  ? "Reconnect to request Gmail read scope and refresh token access."
                  : "Start the Google consent flow to add Gmail read access."}
            </p>
          </div>

          <div className="mt-5">
            {gmailConnected ? (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] font-medium text-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Gmail Connected
                </button>
                <DisconnectGmailButton />
              </div>
            ) : needsReconnect ? (
              <div className="space-y-3">
                <ConnectGmailButton label="Reconnect Gmail" />
                <DisconnectGmailButton />
              </div>
            ) : (
              <ConnectGmailButton label="Connect Gmail" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusPill({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 transition-colors ${
        active
          ? "border-emerald-200 bg-emerald-50/80"
          : "border-zinc-200/80 bg-zinc-50/60"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 text-[13px] font-medium ${
          active ? "text-emerald-700" : "text-zinc-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
