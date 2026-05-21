import { google } from "googleapis";
import { unstable_cache } from "next/cache";

import type {
  GmailConfidenceBand,
  GmailJobStatus,
  GmailMailboxKind,
  GmailMessage,
} from "@/types/gmail";

const INBOX_QUERY =
  'category:primary newer_than:90d -label:spam -label:trash (application OR applied OR recruiter OR interview OR assessment OR offer OR rejection OR received OR confirmation OR stage OR question OR transcript OR availability OR next step)';

const SENT_QUERY =
  "in:sent newer_than:365d (apply OR application OR cv OR resume) -label:spam -label:trash";

const EXCLUDED_SENDERS = [
  "coursera",
  "udemy",
  "newsletter",
  "digest",
  "marketing",
  "promo",
  "github.com",
  "accounts.google.com",
];

const EXCLUDED_SUBJECT_PHRASES = [
  "jobs for you",
  "recommended jobs",
  "job alert",
  "new opportunities",
  "top jobs",
  "digest",
  "newsletter",
];

const TRUSTED_RECRUITER_DOMAINS = [
  "smartrecruiters.com",
  "careers.tiktok.com",
  "greenhouse.io",
  "lever.co",
  "workday.com",
  "ashbyhq.com",
  "workable.com",
  "recruitee.com",
  "jobs.lever.co",
];

const NOISY_NOREPLY_PHRASES = [
  "job alert",
  "recommended jobs",
  "jobs you may like",
  "newsletter",
  "digest",
  "promotion",
  "top jobs",
  "career advice",
];

const JOB_STATUS_RULES: Array<{
  status: Exclude<GmailJobStatus, "UNKNOWN">;
  keywords: Array<{ phrase: string; weight: number }>;
}> = [
  {
    status: "APPLIED",
    keywords: [
      { phrase: "we have received your application", weight: 8 },
      { phrase: "confirmation that we have received", weight: 8 },
      { phrase: "thank you for your application", weight: 7 },
      { phrase: "thank you for your interest", weight: 6 },
      { phrase: "currently reviewing your application", weight: 7 },
      { phrase: "talent acquisition team is currently reviewing", weight: 7 },
      { phrase: "we'll get back to you", weight: 6 },
      { phrase: "we will be in touch shortly", weight: 6 },
      { phrase: "received your application for", weight: 7 },
      { phrase: "application for the", weight: 5 },
      { phrase: "application as", weight: 5 },
    ],
  },
  {
    status: "ASSESSMENT",
    keywords: [
      { phrase: "invite you to the next stage", weight: 8 },
      { phrase: "next stage of the recruitment process", weight: 8 },
      { phrase: "answer a few short questions", weight: 7 },
      { phrase: "additional details before we proceed", weight: 7 },
      { phrase: "provide the following information", weight: 7 },
      { phrase: "provide the following documents", weight: 7 },
      { phrase: "continue processing your application", weight: 6 },
      { phrase: "upload transcripts", weight: 7 },
      { phrase: "availability to commence work", weight: 6 },
      { phrase: "please reply to this email with your", weight: 6 },
      { phrase: "assessment", weight: 6 },
      { phrase: "hackerrank", weight: 6 },
      { phrase: "codility", weight: 6 },
      { phrase: "testgorilla", weight: 6 },
      { phrase: "coding challenge", weight: 6 },
    ],
  },
  {
    status: "INTERVIEW",
    keywords: [
      { phrase: "interview", weight: 8 },
      { phrase: "schedule", weight: 6 },
      { phrase: "availability", weight: 6 },
      { phrase: "zoom", weight: 5 },
      { phrase: "meet", weight: 4 },
      { phrase: "call", weight: 4 },
      { phrase: "next steps", weight: 3 },
      { phrase: "interview time", weight: 7 },
      { phrase: "interview details", weight: 7 },
    ],
  },
  {
    status: "REJECTION",
    keywords: [
      { phrase: "unfortunately", weight: 7 },
      { phrase: "not selected", weight: 7 },
      { phrase: "regret to inform", weight: 7 },
      { phrase: "other candidates", weight: 6 },
      { phrase: "moving forward with other candidates", weight: 7 },
    ],
  },
  {
    status: "OFFER",
    keywords: [
      { phrase: "offer letter", weight: 8 },
      { phrase: "we are pleased", weight: 7 },
      { phrase: "we are delighted", weight: 7 },
      { phrase: "job offer", weight: 8 },
      { phrase: "compensation", weight: 5 },
      { phrase: "joining", weight: 6 },
      { phrase: "start date", weight: 5 },
      { phrase: "salary", weight: 4 },
    ],
  },
  {
    status: "RECRUITER",
    keywords: [
      { phrase: "recruiter", weight: 7 },
      { phrase: "talent acquisition", weight: 6 },
      { phrase: "hiring manager", weight: 5 },
      { phrase: "interested in your profile", weight: 6 },
      { phrase: "reaching out", weight: 4 },
      { phrase: "opportunity we think", weight: 5 },
    ],
  },
];

const DOMAIN_BONUS = [
  "greenhouse.io",
  "lever.co",
  "workable.com",
  "ashbyhq.com",
  "smartrecruiters.com",
  "careers.tiktok.com",
  "workday.com",
  "recruitee.com",
];

const DOMAIN_PENALTY = [
  "coursera.org",
  "udemy.com",
  "linkedin.com",
];

const CLASSIFICATION_THRESHOLD = 3;

export function createGmailClient(
  accessToken?: string | null,
  refreshToken?: string | null,
) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: accessToken ?? undefined,
    refresh_token: refreshToken ?? undefined,
  });

  return google.gmail({
    version: "v1",
    auth: oauth2Client,
  });
}

function getHeaderValue(
  headers: Array<{ name?: string | null; value?: string | null }> | undefined,
  headerName: string,
) {
  return headers?.find((header) => header.name === headerName)?.value ?? "";
}

function normalizeText(...parts: Array<string | null | undefined>) {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function getCombinedText(subject: string, from: string, snippet: string) {
  return normalizeText(subject, from, snippet);
}

function getSenderDomain(from: string) {
  const emailMatch =
    from.match(/<([^>]+)>/) ?? from.match(/([\w.+-]+@[\w.-]+)/);

  const emailAddress = emailMatch?.[1] ?? "";
  const domain = emailAddress.split("@")[1] ?? emailAddress;

  return domain.toLowerCase();
}

function isNoisyNoreplyEmail(from: string, subject: string, snippet: string) {
  const fromLower = from.toLowerCase();
  const isNoreply =
    fromLower.includes("noreply") || fromLower.includes("no-reply");

  if (!isNoreply) {
    return false;
  }

  // Check if it's from trusted recruiting domains
  const senderDomain = getSenderDomain(from);
  const isTrustedRecruiter = TRUSTED_RECRUITER_DOMAINS.some((domain) =>
    senderDomain.includes(domain),
  );

  if (isTrustedRecruiter) {
    return false; // Don't filter out trusted recruiters
  }

  // Check for noisy phrases
  const combinedText = normalizeText(subject, snippet).toLowerCase();
  return NOISY_NOREPLY_PHRASES.some((phrase) => combinedText.includes(phrase));
}

function hasExcludedSubject(subject: string) {
  const subjectLower = subject.toLowerCase();

  return EXCLUDED_SUBJECT_PHRASES.some((phrase) =>
    subjectLower.includes(phrase),
  );
}

function hasExcludedSender(from: string) {
  const fromLower = from.toLowerCase();
  const domain = getSenderDomain(from);

  return EXCLUDED_SENDERS.some(
    (entry) => fromLower.includes(entry) || domain.includes(entry),
  );
}

function getMatchingKeywords(
  text: string,
  keywords: Array<{ phrase: string }>,
) {
  return keywords
    .filter((keyword) => text.includes(keyword.phrase))
    .map((keyword) => keyword.phrase);
}

function scoreStatus(text: string, status: Exclude<GmailJobStatus, "UNKNOWN">) {
  const rule = JOB_STATUS_RULES.find((entry) => entry.status === status);

  if (!rule) {
    return { score: 0, matchedKeywords: [] as string[] };
  }

  const matchedKeywords = getMatchingKeywords(text, rule.keywords);

  return {
    score: rule.keywords.reduce(
      (score, keyword) =>
        score + (text.includes(keyword.phrase) ? keyword.weight : 0),
      0,
    ),
    matchedKeywords,
  };
}

function buildConfidenceBand(confidence: number): GmailConfidenceBand {
  if (confidence >= 0.75) {
    return "high";
  }

  if (confidence >= 0.5) {
    return "medium";
  }

  return "low";
}

export function classifyJobEmail(email: {
  subject: string;
  from: string;
  snippet?: string;
  mailbox: GmailMailboxKind;
}) {
  const subject = email.subject || "";
  const from = email.from || "";
  const snippet = email.snippet || "";
  const combinedText = getCombinedText(subject, from, snippet);

  // Check for noisy no-reply emails
  if (isNoisyNoreplyEmail(from, subject, snippet)) {
    return {
      status: "UNKNOWN" as const,
      confidence: 0,
      confidenceBand: "low" as const,
      matchedKeywords: [] as string[],
      reason: "Filtered as noisy no-reply email",
    };
  }

  if (hasExcludedSubject(subject) || hasExcludedSender(from)) {
    return {
      status: "UNKNOWN" as const,
      confidence: 0,
      confidenceBand: "low" as const,
      matchedKeywords: [] as string[],
      reason: "Filtered as noisy or non-job mail",
    };
  }

  const scoredStatuses = JOB_STATUS_RULES.map((rule) => {
    const scored = scoreStatus(combinedText, rule.status);

    return {
      status: rule.status,
      score: scored.score,
      matchedKeywords: scored.matchedKeywords,
    };
  }).sort((left, right) => right.score - left.score);

  const bestMatch = scoredStatuses[0];
  const secondBest = scoredStatuses[1]?.score ?? 0;

  if (!bestMatch || bestMatch.score < CLASSIFICATION_THRESHOLD) {
    return {
      status: "UNKNOWN" as const,
      confidence: 0.2,
      confidenceBand: "low" as const,
      matchedKeywords: [],
      reason: "No strong job-status keywords matched",
    };
  }

  const senderDomain = getSenderDomain(from);
  const companyDomain =
    DOMAIN_BONUS.find((domain) => senderDomain.includes(domain)) ?? null;
  const penaltyDomain =
    DOMAIN_PENALTY.find((domain) => senderDomain.includes(domain)) ?? null;

  let confidence = bestMatch.score / (bestMatch.score + secondBest + 2);

  if (companyDomain) {
    confidence += 0.2;
  }

  if (penaltyDomain) {
    confidence -= 0.25;
  }

  confidence = Math.max(0, Math.min(1, confidence));

  const reasonParts = [
    `Matched ${bestMatch.status.toLowerCase()} keywords: ${bestMatch.matchedKeywords.join(
      ", ",
    )}`,
    `sender domain: ${senderDomain || "unknown"}`,
  ];

  if (companyDomain) {
    reasonParts.push(`trusted recruiting domain: ${companyDomain}`);
  }

  if (penaltyDomain) {
    reasonParts.push(`penalized noisy domain: ${penaltyDomain}`);
  }

  return {
    status: bestMatch.status,
    confidence,
    confidenceBand: buildConfidenceBand(confidence),
    matchedKeywords: bestMatch.matchedKeywords,
    reason: reasonParts.join("; "),
  };
}

function extractCompanyFromSender(from: string): string | null {
  // Try to extract from "Company Name <email@domain.com>" format
  const displayNameMatch = from.match(/^([^<]+)<[^>]+>$/);
  if (displayNameMatch) {
    const displayName = displayNameMatch[1].trim();
    if (displayName && displayName !== "Unknown") {
      return displayName;
    }
  }

  // Fallback to domain
  const fromMatch = from.match(/@([\w.-]+)/);
  if (fromMatch) {
    const domain = fromMatch[1].split(".")[0];
    if (domain) {
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
  }

  return null;
}

function extractCompanyAndRole(subject: string, from: string) {
  const s = subject || "";

  // Try "application for the [ROLE] role" pattern
  const rolePatternMatch = s.match(
    /application\s+for\s+the\s+(.+?)\s+role/i,
  );
  if (rolePatternMatch) {
    const role = rolePatternMatch[1].trim();
    return { role, company: extractCompanyFromSender(from) };
  }

  // Try "application as [ROLE]" pattern
  const asPatternMatch = s.match(/application\s+as\s+(.+?)(?:\s+at|\s+-|$)/i);
  if (asPatternMatch) {
    const role = asPatternMatch[1].trim();
    return { role, company: extractCompanyFromSender(from) };
  }

  const atMatch = s.match(/(.+?)\s+at\s+(.+)/i);
  if (atMatch) {
    const role = atMatch[1].trim();
    const company = atMatch[2].trim();
    return { company, role };
  }

  const dashMatch = s.match(/(.+?)\s+[\-–—:]\s+(.+)/);
  if (dashMatch) {
    const left = dashMatch[1].trim();
    const right = dashMatch[2].trim();

    // prefer right as role when right is shorter
    if (right.split(" ").length < left.split(" ").length) {
      return { role: right, company: left };
    }

    return { role: left, company: right };
  }

  // Fallback to sender domain
  return { company: extractCompanyFromSender(from), role: null };
}

function normalizeApplicationState(
  mailbox: GmailMailboxKind,
  status: GmailJobStatus,
) {
  if (mailbox === "APPLICATIONS_SENT") {
    return "SENT" as const;
  }

  if (status === "APPLIED") {
    return "APPLIED" as const;
  }

  return undefined;
}

async function fetchJobEmails(
  accessToken: string,
  refreshToken: string | null | undefined,
  mailbox: GmailMailboxKind,
) {
  const gmail = createGmailClient(accessToken, refreshToken);
  const query = mailbox === "APPLICATIONS_SENT" ? SENT_QUERY : INBOX_QUERY;

  const messages: Array<{ id?: string | null; threadId?: string | null }> = [];
  let pageToken: string | undefined;

  do {
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults: 50,
      q: query,
      pageToken,
    });

    messages.push(...(listResponse.data.messages ?? []));
    pageToken = listResponse.data.nextPageToken ?? undefined;
  } while (pageToken && messages.length < 300);

  if (messages.length === 0) {
    return [] as GmailMessage[];
  }

  const detailedMessages = await Promise.all(
    messages.map(async (message) => {
      if (!message.id || !message.threadId) {
        return null;
      }

      const messageResponse = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: ["Subject", "From", "Date"],
      });

      const payload = messageResponse.data.payload;
      const headers = payload?.headers;
      const subject = getHeaderValue(headers, "Subject") || "No subject";
      const from = getHeaderValue(headers, "From") || "Unknown sender";
      const snippet = messageResponse.data.snippet ?? "";
      const classification = classifyJobEmail({
        subject,
        from,
        snippet,
        mailbox,
      });

      const parsed = extractCompanyAndRole(subject, from);
      const applicationState = normalizeApplicationState(
        mailbox,
        classification.status,
      );
      const senderDomain = getSenderDomain(from);

      return {
        id: message.id,
        threadId: message.threadId,
        subject,
        from,
        senderDomain,
        snippet,
        date: getHeaderValue(headers, "Date") || new Date().toISOString(),
        mailbox,
        category: classification.status,
        status: classification.status,
        confidence: classification.confidence,
        confidenceBand: classification.confidenceBand,
        matchedKeywords: classification.matchedKeywords,
        reason: classification.reason,
        company: parsed.company,
        role: parsed.role,
        applicationState,
      } satisfies GmailMessage;
    }),
  );

  return detailedMessages.filter(Boolean) as GmailMessage[];
}

const cachedGetRecentJobEmails = unstable_cache(
  async (
    accessToken: string,
    refreshToken: string | null | undefined,
    mailbox: GmailMailboxKind,
  ) => fetchJobEmails(accessToken, refreshToken, mailbox),
  ["recent-job-emails"],
  {
    revalidate: 60,
  },
);

export async function getRecentJobEmails(
  accessToken: string,
  refreshToken?: string | null,
  mailbox: GmailMailboxKind = "INBOX_ACTIVITY",
) {
  return cachedGetRecentJobEmails(accessToken, refreshToken, mailbox);
}

export async function getSentApplicationEmails(
  accessToken: string,
  refreshToken?: string | null,
) {
  return cachedGetRecentJobEmails(
    accessToken,
    refreshToken,
    "APPLICATIONS_SENT",
  );
}
