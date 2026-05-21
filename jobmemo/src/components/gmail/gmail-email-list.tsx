import {
  BadgeAlert,
  BadgeCheck,
  BriefcaseBusiness,
  Inbox,
  Mail,
  RefreshCcw,
  SearchX,
  Sparkles,
  TimerReset,
  Clock3,
  MessageSquareWarning,
  Rocket,
  BadgeHelp,
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

function confidenceBadgeClass(band: GmailMessage["confidenceBand"]) {
  switch (band) {
    case "high":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "medium":
      return "bg-amber-50 text-amber-800 border-amber-200";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}

function confidenceBadgeLabel(band: GmailMessage["confidenceBand"]) {
  switch (band) {
    case "high":
      return "High confidence";
    case "medium":
      return "Medium confidence";
    default:
      return "Low confidence";
  }
}

function categoryMeta(category: GmailMessage["category"]) {
  const base = {
    APPLIED: {
      label: "Application",
      icon: BriefcaseBusiness,
      className: "bg-slate-100 text-slate-700 border-slate-200",
    },
    INTERVIEW: {
      label: "Interview",
      icon: Clock3,
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    ASSESSMENT: {
      label: "Assessment",
      icon: BadgeCheck,
      className: "bg-violet-50 text-violet-700 border-violet-200",
    },
    OFFER: {
      label: "Offer",
      icon: Rocket,
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    REJECTION: {
      label: "Rejected",
      icon: BadgeAlert,
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
    RECRUITER: {
      label: "Recruiter",
      icon: MessageSquareWarning,
      className: "bg-amber-50 text-amber-800 border-amber-200",
    },
    UNKNOWN: {
      label: "Unknown",
      icon: BadgeHelp,
      className: "bg-zinc-100 text-zinc-700 border-zinc-200",
    },
  } as const;

  return base[category];
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

function KeywordChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 shadow-sm">
      {label}
    </span>
  );
}

function ConfidenceBadge({
  band,
  confidence,
}: {
  band: GmailMessage["confidenceBand"];
  confidence: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${confidenceBadgeClass(band)}`}
      title={confidenceLabel(confidence)}
    >
      {confidenceBadgeLabel(band)}
    </span>
  );
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
}: {
  emails: GmailMessage[];
  title: string;
  description: string;
  mailboxLabel: string;
  syncedAtLabel?: string;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
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

  if (emails.length === 0) {
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
            {emails.length} recent emails
          </span>
        </div>
      </div>

      <div className="max-h-[72vh] divide-y divide-zinc-100 overflow-y-auto">
        {emails.map((email) => {
          const category = categoryMeta(email.category);
          const CategoryIcon = category.icon;

          return (
            <article
              key={email.id}
              className="group flex flex-col gap-3 px-5 py-4 transition-all duration-200 hover:bg-zinc-50/80 md:px-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[16px] font-semibold text-zinc-950 group-hover:text-zinc-900">
                      {email.company ?? "Unknown company"}
                    </p>
                    {statusLabel(email.applicationState ?? email.status) ? (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-700">
                        {statusLabel(email.applicationState ?? email.status)}
                      </span>
                    ) : null}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${category.className}`}
                      title={confidenceLabel(email.confidence)}
                    >
                      <CategoryIcon className="h-3.5 w-3.5" />
                      {category.label}
                    </span>
                    <ConfidenceBadge
                      band={email.confidenceBand}
                      confidence={email.confidence}
                    />
                  </div>
                  <p className="mt-1 text-[14px] font-medium text-zinc-700">
                    {email.role ?? "Role not detected"}
                  </p>
                </div>

                <span className="shrink-0 text-[12px] text-zinc-500">
                  {formatEmailDate(email.date)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {email.matchedKeywords.length > 0 ? (
                  email.matchedKeywords
                    .slice(0, 4)
                    .map((keyword) => (
                      <KeywordChip key={keyword} label={keyword} />
                    ))
                ) : (
                  <KeywordChip label="No strong keyword match" />
                )}
              </div>

              <div className="grid gap-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3 text-[13px] text-zinc-600 md:grid-cols-2">
                <p className="wrap-break-word">
                  <span className="font-medium text-zinc-700">
                    Sender domain:
                  </span>{" "}
                  {email.senderDomain || "unknown"}
                </p>
                <p className="wrap-break-word">
                  <span className="font-medium text-zinc-700">Why:</span>{" "}
                  {email.reason}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
