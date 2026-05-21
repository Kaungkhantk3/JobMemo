import {
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
  BadgeAlert,
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
  return `${Math.round(confidence * 100)}% match`;
}

function categoryMeta(category: GmailMessage["category"]) {
  const base = {
    APPLICATION: {
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
  } as const;

  return base[category];
}

export function GmailEmailList({
  emails,
  syncedAtLabel = "just now",
  errorMessage,
}: {
  emails: GmailMessage[];
  syncedAtLabel?: string;
  errorMessage?: string;
}) {
  if (errorMessage) {
    return (
      <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="border-b border-zinc-200/80 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                <Sparkles className="h-3.5 w-3.5" />
                Gmail inbox
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
                Recent job emails
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
                A safe read-only view of recent job-related Gmail messages.
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
                Gmail inbox
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
                Recent job emails
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
                A safe read-only view of recent job-related Gmail messages.
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
              No matching Gmail messages yet
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-6 text-zinc-500">
              JobMemo checks the latest inbox and updates folders for messages
              about applications, interviews, recruiters, jobs, and offers.
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
              Gmail inbox
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
              Recent job emails
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
              A safe read-only view of recent job-related Gmail messages.
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

      <div className="divide-y divide-zinc-100">
        {emails.map((email) => (
          <article
            key={email.id}
            className="group flex flex-col gap-3 px-5 py-4 transition-all duration-200 hover:bg-zinc-50/80 md:px-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-zinc-950 group-hover:text-zinc-900">
                  {email.from}
                </p>
                <p className="mt-1 text-[15px] font-medium text-zinc-900">
                  {email.subject}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2 text-right">
                <CategoryBadge
                  category={email.category}
                  confidence={email.confidence}
                />
                <span className="text-[12px] text-zinc-500">
                  {formatEmailDate(email.date)}
                </span>
              </div>
            </div>

            <p className="line-clamp-2 max-w-4xl text-[13px] leading-6 text-zinc-600">
              {email.snippet || "No preview available."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CategoryBadge({
  category,
  confidence,
}: {
  category: GmailMessage["category"];
  confidence: number;
}) {
  const meta = categoryMeta(category);
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta.className}`}
      title={confidenceLabel(confidence)}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}
