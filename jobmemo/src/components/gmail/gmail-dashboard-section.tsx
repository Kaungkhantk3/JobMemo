"use client";

import { useState, type ComponentType } from "react";
import {
  Inbox,
  Sparkles,
  TrendingUp,
  Send,
  BadgeCheck,
  BriefcaseBusiness,
  Rocket,
} from "lucide-react";

import type { GmailMailboxKind, GmailMessage } from "@/types/gmail";

import { GmailEmailList } from "./gmail-email-list";
import {
  buildGmailDashboardStats,
  filterRelevantEmails,
  getMailboxCountLabel,
} from "./gmail-display-utils";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-50 p-2.5 text-zinc-700">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  count,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-medium transition-colors ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          active ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-700"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function titleForMailbox(mailbox: GmailMailboxKind) {
  return mailbox === "APPLICATIONS_SENT"
    ? "Sent applications"
    : "Inbox replies";
}

function descriptionForMailbox(mailbox: GmailMailboxKind) {
  return mailbox === "APPLICATIONS_SENT"
    ? "Sent job applications and resume emails that help you track what you’ve already sent."
    : "Received recruiter replies, interview invites, assessments, rejections, and offers.";
}

export function GmailDashboardSection({
  inboxEmails,
  sentEmails,
  inboxError,
  sentError,
  syncedAtLabel = "just now",
}: {
  inboxEmails: GmailMessage[];
  sentEmails: GmailMessage[];
  inboxError?: string;
  sentError?: string;
  syncedAtLabel?: string;
}) {
  const [activeMailbox, setActiveMailbox] =
    useState<GmailMailboxKind>("INBOX_ACTIVITY");
  const [showDebugEmails, setShowDebugEmails] = useState(false);

  const activeEmails =
    activeMailbox === "APPLICATIONS_SENT" ? sentEmails : inboxEmails;
  const activeError =
    activeMailbox === "APPLICATIONS_SENT" ? sentError : inboxError;
  const visibleEmails = showDebugEmails
    ? activeEmails
    : filterRelevantEmails(activeEmails);
  const activeStats = buildGmailDashboardStats(activeEmails);

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="border-b border-zinc-200/80 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              <Sparkles className="h-3.5 w-3.5" />
              Gmail dashboard
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
              Job emails and follow-up status
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
              Recent job-related Gmail messages, grouped by company, role, and
              status.
            </p>
          </div>

          <div className="hidden rounded-2xl bg-zinc-900 p-3 text-white md:block">
            <Inbox className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-700">
            <TrendingUp className="h-3.5 w-3.5" />
            Last synced {syncedAtLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            <Inbox className="h-3.5 w-3.5" />
            {getMailboxCountLabel(
              "INBOX_ACTIVITY",
              filterRelevantEmails(inboxEmails).length,
            )}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            <Send className="h-3.5 w-3.5" />
            {getMailboxCountLabel(
              "APPLICATIONS_SENT",
              filterRelevantEmails(sentEmails).length,
            )}
          </span>
          <button
            type="button"
            onClick={() => setShowDebugEmails((s) => !s)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-medium ${showDebugEmails ? "border-amber-400 bg-amber-50 text-amber-800" : "border-zinc-200 bg-white text-zinc-600"}`}
          >
            Show debug emails
          </button>
        </div>
      </div>

      <div className="border-b border-zinc-100 px-5 py-4 md:px-6">
        <div className="flex flex-wrap gap-2">
          <TabButton
            active={activeMailbox === "INBOX_ACTIVITY"}
            count={filterRelevantEmails(inboxEmails).length}
            label="Inbox replies"
            icon={Inbox}
            onClick={() => setActiveMailbox("INBOX_ACTIVITY")}
          />
          <TabButton
            active={activeMailbox === "APPLICATIONS_SENT"}
            count={filterRelevantEmails(sentEmails).length}
            label="Sent applications"
            icon={Send}
            onClick={() => setActiveMailbox("APPLICATIONS_SENT")}
          />
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total relevant"
            value={activeStats.totalRelevant}
            icon={BriefcaseBusiness}
          />
          <StatCard
            label="Interviews"
            value={activeStats.interviews}
            icon={BadgeCheck}
          />
          <StatCard
            label="Assessments"
            value={activeStats.assessments}
            icon={Sparkles}
          />
          <StatCard
            label="Offers/Rejections"
            value={activeStats.offersRejections}
            icon={Rocket}
          />
        </div>

        <div className="mt-5">
          <GmailEmailList
            key={`${activeMailbox}-${showDebugEmails ? "debug" : "clean"}`}
            emails={visibleEmails}
            title={titleForMailbox(activeMailbox)}
            description={descriptionForMailbox(activeMailbox)}
            mailboxLabel={
              activeMailbox === "APPLICATIONS_SENT"
                ? "Sent applications"
                : "Inbox replies"
            }
            syncedAtLabel={syncedAtLabel}
            errorMessage={activeError}
            showDebugEmails={showDebugEmails}
          />
        </div>
      </div>
    </section>
  );
}
