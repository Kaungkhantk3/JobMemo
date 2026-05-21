export type GmailMessageCategory =
  | "APPLIED"
  | "INTERVIEW"
  | "ASSESSMENT"
  | "OFFER"
  | "REJECTION"
  | "RECRUITER"
  | "UNKNOWN"
  | "OTHER";

export type GmailMailboxKind = "INBOX_ACTIVITY" | "APPLICATIONS_SENT";

export type GmailConfidenceBand = "high" | "medium" | "low";

export type GmailJobStatus =
  | "APPLIED"
  | "INTERVIEW"
  | "ASSESSMENT"
  | "OFFER"
  | "REJECTION"
  | "RECRUITER"
  | "UNKNOWN";

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  senderDomain: string;
  snippet: string;
  date: string;
  mailbox: GmailMailboxKind;
  category: Exclude<GmailMessageCategory, "OTHER">;
  status: GmailJobStatus;
  confidence: number;
  confidenceBand: GmailConfidenceBand;
  matchedKeywords: string[];
  reason: string;
  company?: string | null;
  role?: string | null;
  applicationState?: "APPLIED" | "SENT";
}
