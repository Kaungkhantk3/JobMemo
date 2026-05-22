"use client";

import { useState, type ComponentType } from "react";
import { toast } from "sonner";
import {
  Inbox,
  Sparkles,
  TrendingUp,
  Send,
  BadgeCheck,
  BadgeAlert,
  BriefcaseBusiness,
  SearchX,
} from "lucide-react";

import type {
  GmailJobStatus,
  GmailMailboxKind,
  GmailMessage,
} from "@/types/gmail";

import { GmailEmailList } from "./gmail-email-list";
import {
  buildGmailDashboardStats,
  filterHiddenEmails,
  filterNeedsReviewEmails,
  filterRelevantEmails,
  getMailboxCountLabel,
} from "./gmail-display-utils";

type EmailReview = {
  hidden?: boolean;
  reviewed?: boolean;
  userCorrectedStatus?: GmailJobStatus | null;
};

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

function buildReviewMap(emails: GmailMessage[]) {
  return Object.fromEntries(
    emails.map((email) => [
      email.id,
      {
        hidden: email.hidden,
        reviewed: email.reviewed,
        userCorrectedStatus: email.userCorrectedStatus ?? null,
      } satisfies EmailReview,
    ]),
  ) as Record<string, EmailReview>;
}

function applyReview(email: GmailMessage, review?: EmailReview) {
  return {
    ...email,
    hidden: review?.hidden ?? email.hidden ?? false,
    reviewed: review?.reviewed ?? email.reviewed ?? false,
    userCorrectedStatus:
      review?.userCorrectedStatus ?? email.userCorrectedStatus ?? null,
  } satisfies GmailMessage;
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
  const [showHiddenEmails, setShowHiddenEmails] = useState(false);
  const [emailReviews, setEmailReviews] = useState<Record<string, EmailReview>>(
    () => buildReviewMap([...inboxEmails, ...sentEmails]),
  );

  const reviewedInboxEmails = inboxEmails.map((email) =>
    applyReview(email, emailReviews[email.id]),
  );
  const reviewedSentEmails = sentEmails.map((email) =>
    applyReview(email, emailReviews[email.id]),
  );

  const activeEmails =
    activeMailbox === "APPLICATIONS_SENT"
      ? reviewedSentEmails
      : reviewedInboxEmails;
  const activeError =
    activeMailbox === "APPLICATIONS_SENT" ? sentError : inboxError;

  const activeRelevantEmails = filterRelevantEmails(activeEmails);
  const activeNeedsReviewEmails = filterNeedsReviewEmails(activeEmails);
  const activeHiddenEmails = filterHiddenEmails(activeEmails);

  const activeStats = buildGmailDashboardStats(activeEmails);

  async function patchReview(
    emailId: string,
    payload: {
      hidden?: boolean;
      reviewed?: boolean;
      userCorrectedStatus?: GmailJobStatus | null;
    },
    optimisticReview: EmailReview,
    successMessage: string,
  ) {
    const previousReview = emailReviews[emailId];

    setEmailReviews((current) => ({
      ...current,
      [emailId]: {
        ...current[emailId],
        ...optimisticReview,
      },
    }));

    try {
      const response = await fetch(`/api/gmail/email/${emailId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as {
        review?: EmailReview;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error || "Failed to update Gmail review");
      }

      setEmailReviews((current) => ({
        ...current,
        [emailId]: {
          ...current[emailId],
          ...(result?.review ?? payload),
        },
      }));

      toast.success(successMessage);
    } catch (error) {
      setEmailReviews((current) => {
        if (previousReview) {
          return {
            ...current,
            [emailId]: previousReview,
          };
        }

        const rest = { ...current };
        delete rest[emailId];
        return rest;
      });

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update Gmail review",
      );
    }
  }

  function hideEmail(emailId: string) {
    return patchReview(
      emailId,
      { hidden: true, reviewed: true },
      { hidden: true, reviewed: true },
      "Email hidden",
    );
  }

  function updateEmailStatus(emailId: string, status: GmailJobStatus) {
    return patchReview(
      emailId,
      {
        hidden: false,
        reviewed: true,
        userCorrectedStatus: status,
      },
      {
        hidden: false,
        reviewed: true,
        userCorrectedStatus: status,
      },
      "Classification corrected",
    );
  }

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
              filterRelevantEmails(reviewedInboxEmails).length,
            )}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            <Send className="h-3.5 w-3.5" />
            {getMailboxCountLabel(
              "APPLICATIONS_SENT",
              filterRelevantEmails(reviewedSentEmails).length,
            )}
          </span>
          <button
            type="button"
            onClick={() => setShowHiddenEmails((current) => !current)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-medium ${showHiddenEmails ? "border-amber-400 bg-amber-50 text-amber-800" : "border-zinc-200 bg-white text-zinc-600"}`}
          >
            Show hidden emails
            <span className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] text-inherit">
              {activeHiddenEmails.length}
            </span>
          </button>
        </div>
      </div>

      <div className="border-b border-zinc-100 px-5 py-4 md:px-6">
        <div className="flex flex-wrap gap-2">
          <TabButton
            active={activeMailbox === "INBOX_ACTIVITY"}
            count={filterRelevantEmails(reviewedInboxEmails).length}
            label="Inbox replies"
            icon={Inbox}
            onClick={() => setActiveMailbox("INBOX_ACTIVITY")}
          />
          <TabButton
            active={activeMailbox === "APPLICATIONS_SENT"}
            count={filterRelevantEmails(reviewedSentEmails).length}
            label="Sent applications"
            icon={Send}
            onClick={() => setActiveMailbox("APPLICATIONS_SENT")}
          />
        </div>
      </div>

      <div className="p-5 md:p-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Relevant emails"
            value={activeStats.totalRelevant}
            icon={BriefcaseBusiness}
          />
          <StatCard
            label="Applied"
            value={activeStats.applied}
            icon={BadgeCheck}
          />
          <StatCard
            label="Interviews"
            value={activeStats.interviews}
            icon={TrendingUp}
          />
          <StatCard
            label="Assessments"
            value={activeStats.assessments}
            icon={Sparkles}
          />
          <StatCard label="Offers" value={activeStats.offers} icon={Send} />
          <StatCard
            label="Rejections"
            value={activeStats.rejections}
            icon={BadgeAlert}
          />
          <StatCard
            label="Needs review"
            value={activeStats.needsReview}
            icon={SearchX}
          />
          <StatCard label="Hidden" value={activeStats.hidden} icon={Inbox} />
        </div>

        <div className="mt-5 space-y-5">
          <GmailEmailList
            key={`${activeMailbox}-main`}
            emails={activeRelevantEmails}
            title={titleForMailbox(activeMailbox)}
            description={descriptionForMailbox(activeMailbox)}
            mailboxLabel={
              activeMailbox === "APPLICATIONS_SENT"
                ? "Sent applications"
                : "Inbox replies"
            }
            syncedAtLabel={syncedAtLabel}
            errorMessage={activeError}
            emptyTitle="No relevant emails yet"
            emptyDescription="JobMemo is waiting for job-related Gmail activity that matches your current mailbox."
            onHideEmail={hideEmail}
            onChangeStatus={updateEmailStatus}
          />

          <section className="rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
            <div className="border-b border-zinc-200/80 px-5 py-4 md:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                    Needs review
                  </p>
                  <h2 className="mt-2 text-[18px] font-semibold text-zinc-950">
                    Emails that need your confirmation
                  </h2>
                  <p className="mt-1 text-[13px] leading-6 text-zinc-600">
                    Low-confidence matches, incomplete metadata, or unclear
                    classifications are parked here for manual correction.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
                  {activeNeedsReviewEmails.length}
                </span>
              </div>
            </div>

            <div className="p-5 md:p-6">
              <GmailEmailList
                key={`${activeMailbox}-review`}
                emails={activeNeedsReviewEmails}
                title="Needs review"
                description="Confirm the right status or hide anything that is not job-related."
                mailboxLabel="Needs review"
                syncedAtLabel={syncedAtLabel}
                emptyTitle="No emails need review"
                emptyDescription="Every visible email in this mailbox has enough confidence and metadata to stay in the main list."
                onHideEmail={hideEmail}
                onChangeStatus={updateEmailStatus}
              />
            </div>
          </section>

          {showHiddenEmails ? (
            <section className="rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
              <div className="border-b border-zinc-200/80 px-5 py-4 md:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Hidden emails
                    </p>
                    <h2 className="mt-2 text-[18px] font-semibold text-zinc-950">
                      Hidden emails debug section
                    </h2>
                    <p className="mt-1 text-[13px] leading-6 text-zinc-600">
                      These emails were hidden from the default view after
                      manual review.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
                    {activeHiddenEmails.length}
                  </span>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <GmailEmailList
                  key={`${activeMailbox}-hidden`}
                  emails={activeHiddenEmails}
                  title="Hidden emails"
                  description="Debug-only view of emails you chose to hide from the main inbox review flow."
                  mailboxLabel="Hidden emails"
                  syncedAtLabel={syncedAtLabel}
                  emptyTitle="No hidden emails"
                  emptyDescription="Hidden emails will appear here after you choose to hide them from the main view."
                  onHideEmail={hideEmail}
                  onChangeStatus={updateEmailStatus}
                  actionsEnabled={false}
                />
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}
