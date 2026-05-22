"use client";

import { useState } from "react";
import {
  Inbox,
  Mail,
  RefreshCcw,
  SearchX,
  Sparkles,
  TimerReset,
} from "lucide-react";

import type { GmailJobStatus, GmailMessage } from "@/types/gmail";

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

const MANUAL_STATUS_OPTIONS: Array<{ value: GmailJobStatus; label: string }> = [
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "ASSESSMENT", label: "Assessment" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTION", label: "Rejected" },
  { value: "RECRUITER", label: "Recruiter" },
];

export function GmailEmailList({
  emails,
  title,
  description,
  mailboxLabel,
  syncedAtLabel = "just now",
  errorMessage,
  emptyTitle = "No matching Gmail messages yet",
  emptyDescription = "JobMemo checks the latest inbox and sent mail for relevant job activity.",
  onHideEmail,
  onChangeStatus,
}: {
  emails: GmailMessage[];
  title: string;
  description: string;
  mailboxLabel: string;
  syncedAtLabel?: string;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onHideEmail: (emailId: string) => void;
  onChangeStatus: (emailId: string, status: GmailJobStatus) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(5);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const visibleEmails = emails.slice(0, visibleCount);
  const hasMoreEmails = visibleCount < emails.length;

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
            {emails.length} relevant job emails
          </span>
        </div>
      </div>

      <div className="border-t border-zinc-100">
        <div className="max-h-[520px] divide-y divide-zinc-100 overflow-y-auto">
          {visibleEmails.map((email) => {
            const resolvedStatus = email.applicationState ?? email.status;

            return (
              <article
                key={email.id}
                className="group flex flex-col gap-3 px-5 py-4 transition-all duration-200 hover:bg-zinc-50/80 md:px-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {statusLabel(resolvedStatus) ? (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-700">
                          {statusLabel(resolvedStatus)}
                        </span>
                      ) : null}
                      <p className="text-[16px] font-semibold text-zinc-950 group-hover:text-zinc-900">
                        {email.company ?? "Unknown company"}
                      </p>
                    </div>
                    <p className="mt-1 text-[14px] font-medium text-zinc-700">
                      {email.role ?? "Role not detected"}
                    </p>
                    <p className="mt-2 text-[16px] font-semibold text-zinc-950 group-hover:text-zinc-900">
                      {email.subject ?? "(No subject)"}
                    </p>
                    <p className="mt-2 text-[13px] text-zinc-700 line-clamp-2">
                      {email.snippet ?? ""}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-[12px] text-zinc-500">
                      {formatEmailDate(email.date)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveActionId((current) =>
                          current === email.id ? null : email.id,
                        )
                      }
                      className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                    >
                      Mark incorrect
                    </button>
                  </div>
                </div>

                {activeActionId === email.id ? (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                        Mark incorrect
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveActionId(null)}
                        className="text-[12px] font-medium text-zinc-500 hover:text-zinc-900"
                      >
                        Close
                      </button>
                    </div>

                    <p className="mt-2 text-[13px] leading-6 text-zinc-600">
                      Hide this email or change its status manually.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onHideEmail(email.id);
                          setActiveActionId(null);
                        }}
                        className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[12px] font-medium text-rose-700 hover:bg-rose-100"
                      >
                        Hide this email
                      </button>

                      {MANUAL_STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            onChangeStatus(email.id, option.value);
                            setActiveActionId(null);
                          }}
                          className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-5 py-4 md:px-6">
          <p className="text-[12px] text-zinc-500">
            Showing {visibleEmails.length} of {emails.length}
          </p>

          {hasMoreEmails ? (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 10)}
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-[12px] font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
            >
              Show more
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
