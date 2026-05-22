import type { GmailMessage, GmailJobStatus } from "@/types/gmail";

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

export function isRelevantEmail(email: GmailMessage) {
  if (email.category === "UNKNOWN") {
    return false;
  }

  if (email.confidenceBand === "low") {
    return false;
  }

  return getStrongPhraseMatch(email).matched;
}

export function filterRelevantEmails(emails: GmailMessage[]) {
  return emails.filter(isRelevantEmail);
}

export function buildGmailDashboardStats(emails: GmailMessage[]) {
  const relevantEmails = filterRelevantEmails(emails);

  const interviews = relevantEmails.filter(
    (email) => (email.applicationState ?? email.status) === "INTERVIEW",
  ).length;

  const assessments = relevantEmails.filter(
    (email) => (email.applicationState ?? email.status) === "ASSESSMENT",
  ).length;

  const offersRejections = relevantEmails.filter((email) => {
    const status = email.applicationState ?? email.status;

    return status === "OFFER" || status === "REJECTION";
  }).length;

  return {
    totalRelevant: relevantEmails.length,
    interviews,
    assessments,
    offersRejections,
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
