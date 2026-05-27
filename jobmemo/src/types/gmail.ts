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
  status: string;
  confidence: number;
  confidenceBand: GmailConfidenceBand;
  matchedKeywords: string[];
  reason: string;
  company?: string | null;
  role?: string | null;
  applicationState?: "APPLIED" | "SENT";
  hidden?: boolean;
  userCorrectedStatus?: GmailJobStatus | null;
  reviewed?: boolean;
  source?: string | null;
  syncedAt?: string | null;
  notes?: string | null;
  applicationId?: string | null;
}

export interface GmailSuggestion {
  id: string;
  threadId?: string | null;
  company?: string | null;
  position?: string | null;
  status?: string | null;
  confidence?: number | null;
  hidden?: boolean;
  userCorrectedStatus?: GmailJobStatus | null;
  reviewed?: boolean;
  source?: string | null;
  syncedAt?: string | null;
  notes?: string | null;
}
