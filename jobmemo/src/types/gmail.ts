export type GmailMessageCategory =
  | "APPLICATION"
  | "INTERVIEW"
  | "ASSESSMENT"
  | "OFFER"
  | "REJECTION"
  | "RECRUITER"
  | "OTHER";

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
  category: Exclude<GmailMessageCategory, "OTHER">;
  confidence: number;
}
