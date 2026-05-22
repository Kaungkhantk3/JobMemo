import {
  Inbox,
  Mail,
  RefreshCcw,
  SearchX,
  Sparkles,
  TimerReset,
} from "lucide-react";

import type { GmailMessage } from "@/types/gmail";

import { ConnectGmailButton } from "./connect-gmail-button";

function formatEmailDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function confidenceLabel(confidence: number) {
  return `${Math.round(confidence * 100)}% confidence`;
}

function statusLabel(
  status?: GmailMessage["applicationState"] | GmailMessage["status"],
) {
  switch (status) {
    case "APPLIED":
      return "Applied";
    case "SENT":
      return "Sent";
    case "INTERVIEW":
      return "Interview";
    case "ASSESSMENT":
      return "Assessment";
    case "REJECTION":
      return "Rejected";
    case "OFFER":
      return "Offer";
    case "RECRUITER":
      return "Recruiter";
    case "UNKNOWN":
      return "Unknown";
    default:
      return null;
  }
}

export function GmailEmailList({
  emails,
  title,
  description,
  mailboxLabel,
  syncedAtLabel = "just now",
  errorMessage,
  emptyTitle = "No matching Gmail messages yet",
  emptyDescription = "JobMemo checks the latest inbox and sent mail for relevant job activity.",
  developerMode = false,
}: {
  emails: GmailMessage[];
  title: string;
  description: string;
  mailboxLabel: string;
  syncedAtLabel?: string;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  developerMode?: boolean;
}) {
  const strongPhrases: Record<string, string[]> = {
    APPLIED: [
      "thank you for your application",
      "we received your application",
      "application received",
      "your application for",
      "currently reviewing your application",
    ],
    INTERVIEW: [
      "interview",
      "schedule a call",
      "availability",
      "meet with",
      "next stage",
    ],
    ASSESSMENT: [
      "assessment",
      "coding challenge",
      "online test",
      "technical test",
      "answer a few questions",
    ],
    REJECTION: [
      "unfortunately",
      "not selected",
      "regret to inform",
      "moved forward with other candidates",
    ],
    OFFER: [
      "offer letter",
      "pleased to offer",
      "job offer",
      "compensation package",
    ],
  };

  function matchesStrongPhrases(email: GmailMessage) {
    const text = `${email.subject ?? ""} ${email.snippet ?? ""}`.toLowerCase();
    for (const phrases of Object.values(strongPhrases)) {
      for (const p of phrases) {
        if (text.includes(p)) return true;
      }
    }
    return false;
  }

  const filteredEmails = emails.filter((email) => {
    // hide UNKNOWN by default
    if (email.category === "UNKNOWN") return false;
    // hide low-confidence by default
    if (email.confidenceBand === "low") return false;
    // require strong phrase match
    if (!matchesStrongPhrases(email)) return false;
    return true;
  });
  if (errorMessage) {
    return (
      <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="border-b border-zinc-200/80 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                <Sparkles className="h-3.5 w-3.5" />
                {mailboxLabel}
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
                {description}
              </p>
            </div>

            <div className="hidden rounded-2xl bg-zinc-900 p-3 text-white md:block">
              <Inbox className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm">
            <p className="text-[15px] font-medium">
              Unable to fetch Gmail messages.
            </p>
            <p className="mt-1 text-[13px] leading-6 text-amber-800/90">
              {errorMessage}
            </p>
            <div className="mt-4">
              <ConnectGmailButton label="Reconnect Gmail" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (filteredEmails.length === 0) {
    return (
      <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="border-b border-zinc-200/80 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                <Sparkles className="h-3.5 w-3.5" />
                {mailboxLabel}
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
                {description}
              </p>
            </div>

            <div className="hidden rounded-2xl bg-zinc-900 p-3 text-white md:block">
              <Inbox className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="px-5 py-6 md:px-6 md:py-8">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/60 px-6 py-16 text-center">
            <div className="rounded-2xl bg-white p-3 text-zinc-500 shadow-sm">
              <SearchX className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-[18px] font-semibold text-zinc-950">
              {emptyTitle}
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-6 text-zinc-500">
              {emptyDescription}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12px] text-zinc-600 shadow-sm">
              <TimerReset className="h-3.5 w-3.5" />
              Last synced {syncedAtLabel}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="border-b border-zinc-200/80 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              <Inbox className="h-3.5 w-3.5" />
              {mailboxLabel}
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
              {description}
            </p>
          </div>

          <div className="hidden rounded-2xl bg-zinc-900 p-3 text-white md:block">
            <Mail className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700">
            <RefreshCcw className="h-3.5 w-3.5" />
            Sync badge
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            <TimerReset className="h-3.5 w-3.5" />
            Last synced {syncedAtLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            <Inbox className="h-3.5 w-3.5" />
            {filteredEmails.length} relevant job emails
          </span>
        </div>
      </div>

      <div className="max-h-[72vh] divide-y divide-zinc-100 overflow-y-auto">
        {filteredEmails.map((email) => {
          return (
            <article
              key={email.id}
              className="group flex flex-col gap-3 px-5 py-4 transition-all duration-200 hover:bg-zinc-50/80 md:px-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[16px] font-semibold text-zinc-950 group-hover:text-zinc-900">
                    {email.subject ?? "(No subject)"}
                  </p>
                  <p className="mt-2 text-[13px] text-zinc-700 line-clamp-2">
                    {email.snippet ?? ""}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    {statusLabel(email.applicationState ?? email.status) ? (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-700">
                        {statusLabel(email.applicationState ?? email.status)}
                      </span>
                    ) : null}
                    <div className="text-[13px] text-zinc-700">
                      <div className="font-medium">
                        {email.company ?? "Unknown company"}
                      </div>
                      <div className="text-[13px]">
                        {email.role ?? "Role not detected"}
                      </div>
                    </div>
                  </div>
                </div>

                <span className="shrink-0 text-[12px] text-zinc-500">
                  {formatEmailDate(email.date)}
                </span>
              </div>
              {developerMode ? (
                <div className="mt-2 text-[12px] text-zinc-500">
                  <div>
                    Matched keywords: {email.matchedKeywords.join(", ") || "-"}
                  </div>
                  <div>Sender domain: {email.senderDomain || "-"}</div>
                  <div>Why: {email.reason || "-"}</div>
                  <div>Confidence: {confidenceLabel(email.confidence)}</div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
