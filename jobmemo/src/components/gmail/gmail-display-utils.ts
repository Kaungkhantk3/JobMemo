import type { GmailMessage, GmailJobStatus } from "@/types/gmail";

const REVIEWED_JOB_STATUSES: Exclude<GmailJobStatus, "UNKNOWN">[] = [
  "APPLIED",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "REJECTION",
];

const STRONG_JOB_PHRASES: Record<string, string[]> = {
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

export function getStrongPhraseMatch(email: GmailMessage) {
  const text = `${email.subject ?? ""} ${email.snippet ?? ""}`.toLowerCase();

  for (const [status, phrases] of Object.entries(STRONG_JOB_PHRASES)) {
    const matched = phrases.filter((phrase) => text.includes(phrase));

    if (matched.length > 0) {
      return {
        matched: true,
        status: status as Exclude<GmailJobStatus, "UNKNOWN">,
        matchedPhrases: matched,
      };
    }
  }

  return {
    matched: false,
    status: null as Exclude<GmailJobStatus, "UNKNOWN"> | null,
    matchedPhrases: [] as string[],
  };
}

export function getResolvedEmailStatus(email: GmailMessage) {
  return email.userCorrectedStatus ?? email.applicationState ?? email.status;
}

export function isHiddenEmail(email: GmailMessage) {
  return email.hidden === true;
}

export function isNeedsReviewEmail(email: GmailMessage) {
  if (isHiddenEmail(email)) {
    return false;
  }

  if (email.reviewed || email.userCorrectedStatus) {
    return false;
  }

  const resolvedStatus = getResolvedEmailStatus(email);

  if (resolvedStatus === "UNKNOWN") {
    return true;
  }

  if (email.confidenceBand === "low") {
    return true;
  }

  if (!email.company || !email.role) {
    return true;
  }

  return !getStrongPhraseMatch(email).matched;
}

export function isRelevantEmail(email: GmailMessage) {
  if (isHiddenEmail(email)) {
    return false;
  }

  if (isNeedsReviewEmail(email)) {
    return false;
  }

  const resolvedStatus = getResolvedEmailStatus(email);

  return (
    resolvedStatus === "SENT" ||
    REVIEWED_JOB_STATUSES.includes(
      resolvedStatus as Exclude<GmailJobStatus, "UNKNOWN">,
    )
  );
}

export function filterRelevantEmails(emails: GmailMessage[]) {
  return emails.filter(isRelevantEmail);
}

export function filterNeedsReviewEmails(emails: GmailMessage[]) {
  return emails.filter(isNeedsReviewEmail);
}

export function filterHiddenEmails(emails: GmailMessage[]) {
  return emails.filter(isHiddenEmail);
}

export function buildGmailDashboardStats(emails: GmailMessage[]) {
  const relevantEmails = filterRelevantEmails(emails);

  const applied = relevantEmails.filter((email) => {
    const status = getResolvedEmailStatus(email);

    return status === "APPLIED" || status === "SENT";
  }).length;

  const interviews = relevantEmails.filter(
    (email) => getResolvedEmailStatus(email) === "INTERVIEW",
  ).length;

  const assessments = relevantEmails.filter(
    (email) => getResolvedEmailStatus(email) === "ASSESSMENT",
  ).length;

  const offers = relevantEmails.filter(
    (email) => getResolvedEmailStatus(email) === "OFFER",
  ).length;

  const rejections = relevantEmails.filter(
    (email) => getResolvedEmailStatus(email) === "REJECTION",
  ).length;

  const needsReview = filterNeedsReviewEmails(emails).length;
  const hidden = filterHiddenEmails(emails).length;

  return {
    totalRelevant: relevantEmails.length,
    applied,
    interviews,
    assessments,
    offers,
    rejections,
    needsReview,
    hidden,
  };
}

export function getMailboxCountLabel(
  mailbox: "INBOX_ACTIVITY" | "APPLICATIONS_SENT",
  count: number,
) {
  return mailbox === "INBOX_ACTIVITY"
    ? `${count} relevant replies`
    : `${count} sent applications`;
}
