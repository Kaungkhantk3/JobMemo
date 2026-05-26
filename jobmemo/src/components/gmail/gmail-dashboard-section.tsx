"use client";

import { useMemo, useState, type ComponentType } from "react";
import { toast } from "sonner";
import {
  Inbox,
  Sparkles,
  TrendingUp,
  Send,
  BadgeCheck,
  BriefcaseBusiness,
  SearchX,
  RefreshCcw,
} from "lucide-react";

import type {
  GmailJobStatus,
  GmailMailboxKind,
  GmailMessage,
} from "@/types/gmail";
import type { Application } from "@/types/application";
import {
  gmailStatusFromReviewDecision,
  type ReviewDecision,
} from "@/lib/applications";

import { GmailEmailList } from "./gmail-email-list";
import { GmailReviewModal } from "./gmail-review-modal";
import {
  buildGmailDashboardStats,
  filterNeedsReviewEmails,
  filterRelevantEmails,
  getMailboxCountLabel,
} from "./gmail-display-utils";

type EmailReview = {
  hidden?: boolean;
  reviewed?: boolean;
  userCorrectedStatus?: GmailJobStatus | null;
  company?: string | null;
  role?: string | null;
  position?: string | null;
  status?: string | null;
  confidence?: number | null;
  source?: string | null;
  syncedAt?: string | null;
  notes?: string | null;
  threadId?: string | null;
  applicationId?: string | null;
};

type ActiveView = "INBOX_ACTIVITY" | "APPLICATIONS_SENT" | "NEEDS_REVIEW";

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
        company: email.company ?? null,
        role: email.role ?? null,
        position: email.role ?? null,
        status: email.status ?? null,
        confidence: email.confidence ?? null,
        source: email.source ?? null,
        syncedAt: email.syncedAt ?? null,
        notes: email.notes ?? null,
        threadId: email.threadId,
        applicationId: email.applicationId ?? null,
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
    company: review?.company ?? email.company ?? null,
    role: review?.position ?? review?.role ?? email.role ?? null,
    status: review?.status ?? email.status ?? null,
    confidence: review?.confidence ?? email.confidence ?? null,
    source: review?.source ?? email.source ?? null,
    syncedAt: review?.syncedAt ?? email.syncedAt ?? null,
    notes: review?.notes ?? email.notes ?? null,
    threadId: review?.threadId ?? email.threadId,
    applicationId: review?.applicationId ?? email.applicationId ?? null,
  } satisfies GmailMessage;
}

export function GmailDashboardSection({
  inboxEmails,
  sentEmails,
  inboxError,
  sentError,
  syncedAtLabel = "just now",
  loading = false,
  syncing = false,
  onSyncGmail,
  onApplicationTracked,
}: {
  inboxEmails: GmailMessage[];
  sentEmails: GmailMessage[];
  inboxError?: string;
  sentError?: string;
  syncedAtLabel?: string;
  loading?: boolean;
  syncing?: boolean;
  onSyncGmail?: () => void | Promise<void>;
  onApplicationTracked?: (application: Application) => void;
}) {
  const [activeView, setActiveView] = useState<ActiveView>("INBOX_ACTIVITY");
  const [reviewingEmail, setReviewingEmail] = useState<GmailMessage | null>(
    null,
  );
  const [savingReview, setSavingReview] = useState(false);
  const [emailReviews, setEmailReviews] = useState<Record<string, EmailReview>>(
    () => buildReviewMap([...inboxEmails, ...sentEmails]),
  );

  const reviewedInboxEmails = useMemo(
    () =>
      inboxEmails.map((email) => applyReview(email, emailReviews[email.id])),
    [emailReviews, inboxEmails],
  );
  const reviewedSentEmails = useMemo(
    () => sentEmails.map((email) => applyReview(email, emailReviews[email.id])),
    [emailReviews, sentEmails],
  );

  const inboxRelevantEmails = useMemo(
    () => filterRelevantEmails(reviewedInboxEmails),
    [reviewedInboxEmails],
  );
  const sentRelevantEmails = useMemo(
    () => filterRelevantEmails(reviewedSentEmails),
    [reviewedSentEmails],
  );
  const activeNeedsReviewEmails = useMemo(
    () =>
      filterNeedsReviewEmails([...reviewedInboxEmails, ...reviewedSentEmails]),
    [reviewedInboxEmails, reviewedSentEmails],
  );

  const inboxStats = useMemo(
    () => buildGmailDashboardStats(reviewedInboxEmails),
    [reviewedInboxEmails],
  );
  const sentStats = useMemo(
    () => buildGmailDashboardStats(reviewedSentEmails),
    [reviewedSentEmails],
  );
  const activeStats =
    activeView === "APPLICATIONS_SENT" ? sentStats : inboxStats;

  const activeEmails =
    activeView === "APPLICATIONS_SENT"
      ? sentRelevantEmails
      : activeView === "NEEDS_REVIEW"
        ? activeNeedsReviewEmails
        : inboxRelevantEmails;
  const activeError =
    activeView === "APPLICATIONS_SENT" ? sentError : inboxError;

  function openReviewModal(email: GmailMessage) {
    setReviewingEmail(email);
  }

  function closeReviewModal() {
    if (savingReview) {
      return;
    }

    setReviewingEmail(null);
  }

  async function submitReview(
    email: GmailMessage,
    payload: {
      company: string;
      position: string;
      status: ReviewDecision;
      notes: string;
      hideEmail: boolean;
    },
  ) {
    const previousReview = emailReviews[email.id];
    const optimisticReview: EmailReview = {
      hidden: payload.hideEmail || payload.status === "IGNORE",
      reviewed: true,
      userCorrectedStatus: gmailStatusFromReviewDecision(payload.status),
      company: payload.company,
      role: payload.position,
      position: payload.position,
      status: payload.status,
      confidence: email.confidence,
      source: "gmail",
      syncedAt: new Date().toISOString(),
      notes: payload.notes,
      threadId: email.threadId,
    };

    setSavingReview(true);
    setEmailReviews((current) => ({
      ...current,
      [email.id]: {
        ...current[email.id],
        ...optimisticReview,
      },
    }));

    try {
      const response = await fetch(`/api/gmail/email/${email.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: payload.company,
          position: payload.position,
          status: payload.status,
          notes: payload.notes,
          hidden: payload.hideEmail || payload.status === "IGNORE",
          reviewed: true,
          threadId: email.threadId,
          confidence: email.confidence,
          emailSubject: email.subject,
          emailDate: email.date,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        review?: EmailReview;
        application?: Application | null;
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.error || "Failed to update Gmail review");
      }

      setEmailReviews((current) => ({
        ...current,
        [email.id]: {
          ...current[email.id],
          ...(result?.review ?? optimisticReview),
        },
      }));

      if (result?.application) {
        onApplicationTracked?.(result.application);
      }

      toast.success("Review saved");
      return result?.review ?? optimisticReview;
    } catch (error) {
      setEmailReviews((current) => {
        if (previousReview) {
          return {
            ...current,
            [email.id]: previousReview,
          };
        }

        const rest = { ...current };
        delete rest[email.id];
        return rest;
      });

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update Gmail review",
      );

      throw error;
    } finally {
      setSavingReview(false);
    }
  }

  async function saveReview(payload: {
    company: string;
    position: string;
    status: ReviewDecision;
    notes: string;
    hideEmail: boolean;
  }) {
    if (!reviewingEmail) {
      return;
    }

    await submitReview(reviewingEmail, payload);

    setReviewingEmail(null);
  }

  async function hideEmail(emailId: string) {
    const email = activeEmails.find((entry) => entry.id === emailId);

    if (!email) {
      return;
    }

    return submitReview(email, {
      company: email.company ?? "",
      position: email.role ?? "",
      status: "IGNORE",
      notes: email.notes ?? "",
      hideEmail: true,
    });
  }

  const activeMailboxLabel =
    activeView === "APPLICATIONS_SENT"
      ? "Sent applications"
      : activeView === "NEEDS_REVIEW"
        ? "Needs review"
        : "Inbox replies";

  const activeDescription =
    activeView === "APPLICATIONS_SENT"
      ? descriptionForMailbox("APPLICATIONS_SENT")
      : activeView === "NEEDS_REVIEW"
        ? "Emails that need your confirmation before JobMemo can track them accurately."
        : descriptionForMailbox("INBOX_ACTIVITY");

  function renderLoadingGrid() {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-zinc-200/80 bg-white px-4 py-4 shadow-sm"
          >
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
            <div className="mt-3 h-8 w-14 animate-pulse rounded bg-zinc-200" />
            <div className="mt-3 h-3 w-24 animate-pulse rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    );
  }

  function renderLoadingList() {
    return (
      <div className="rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
        <div className="border-b border-zinc-200/80 px-5 py-5 md:px-6">
          <div className="h-5 w-28 animate-pulse rounded-full bg-zinc-200" />
          <div className="mt-4 h-8 w-72 max-w-full animate-pulse rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="divide-y divide-zinc-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-5 py-4 md:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="h-3 w-36 animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
                </div>
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
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
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
              Job emails and follow-up status
            </h2>
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
            {getMailboxCountLabel("INBOX_ACTIVITY", inboxRelevantEmails.length)}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            <Send className="h-3.5 w-3.5" />
            {getMailboxCountLabel(
              "APPLICATIONS_SENT",
              sentRelevantEmails.length,
            )}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            <SearchX className="h-3.5 w-3.5" />
            {activeNeedsReviewEmails.length} needs review
          </span>
          {onSyncGmail ? (
            <button
              type="button"
              onClick={() => void onSyncGmail()}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Gmail"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="border-b border-zinc-100 px-5 py-4 md:px-6">
        <div className="flex flex-wrap gap-2">
          <TabButton
            active={activeView === "INBOX_ACTIVITY"}
            count={inboxRelevantEmails.length}
            label="Inbox replies"
            icon={Inbox}
            onClick={() => setActiveView("INBOX_ACTIVITY")}
          />
          <TabButton
            active={activeView === "APPLICATIONS_SENT"}
            count={sentRelevantEmails.length}
            label="Sent applications"
            icon={Send}
            onClick={() => setActiveView("APPLICATIONS_SENT")}
          />
          <TabButton
            active={activeView === "NEEDS_REVIEW"}
            count={activeNeedsReviewEmails.length}
            label="Needs review"
            icon={SearchX}
            onClick={() => setActiveView("NEEDS_REVIEW")}
          />
        </div>
      </div>

      <div className="p-5 md:p-6">
        {loading ? (
          renderLoadingGrid()
        ) : (
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
              label="Needs review"
              value={activeNeedsReviewEmails.length}
              icon={SearchX}
            />
          </div>
        )}

        <div className="mt-5">
          {loading ? (
            renderLoadingList()
          ) : activeView === "NEEDS_REVIEW" ? (
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
                  key={`${activeView}-review`}
                  emails={activeNeedsReviewEmails}
                  title="Needs review"
                  description="Confirm the right status or hide anything that is not job-related."
                  mailboxLabel="Needs review"
                  syncedAtLabel={syncedAtLabel}
                  emptyTitle="No emails need review"
                  emptyDescription="Every visible email in this mailbox has enough confidence and metadata to stay in the main list."
                  onReviewEmail={openReviewModal}
                  onHideEmail={hideEmail}
                />
              </div>
            </section>
          ) : (
            <GmailEmailList
              key={`${activeView}-main`}
              emails={activeEmails}
              title={activeMailboxLabel}
              description={activeDescription}
              mailboxLabel={activeMailboxLabel}
              syncedAtLabel={syncedAtLabel}
              errorMessage={activeError}
              emptyTitle="No relevant emails yet"
              emptyDescription="JobMemo is waiting for job-related Gmail activity that matches your current mailbox."
              onReviewEmail={openReviewModal}
              onHideEmail={hideEmail}
            />
          )}
        </div>
      </div>

      <GmailReviewModal
        key={reviewingEmail?.id ?? "gmail-review-modal"}
        open={!!reviewingEmail}
        email={reviewingEmail}
        submitting={savingReview}
        onClose={closeReviewModal}
        onConfirm={saveReview}
      />
    </section>
  );
}
