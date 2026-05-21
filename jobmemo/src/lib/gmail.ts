import { google } from "googleapis";
import { unstable_cache } from "next/cache";

import type { GmailMessage, GmailMessageCategory } from "@/types/gmail";

const GMAIL_QUERY =
  "(category:primary OR category:updates OR from:linkedin.com OR from:jobsdb.com OR from:greenhouse.io OR from:lever.co OR from:workday.com OR from:smartrecruiters.com OR from:ashbyhq.com OR from:indeed.com) (application OR interview OR recruiter OR job OR offer OR assessment OR hiring OR candidate)";

const EXCLUDED_KEYWORDS = [
  "jobs you may be interested in",
  "recommended jobs",
  "job alert",
  "new jobs",
  "top jobs",
  "career advice",
  "salary guide",
  "hiring trends",
  "promoted",
  "newsletter",
  "digest",
];

const CATEGORY_RULES: Array<{
  category: Exclude<GmailMessageCategory, "OTHER">;
  keywords: Array<{ phrase: string; weight: number }>;
}> = [
  {
    category: "APPLICATION",
    keywords: [
      { phrase: "application received", weight: 5 },
      { phrase: "thank you for applying", weight: 5 },
      { phrase: "application status", weight: 4 },
      { phrase: "shortlisted", weight: 4 },
    ],
  },
  {
    category: "INTERVIEW",
    keywords: [
      { phrase: "interview", weight: 5 },
      { phrase: "recruiter", weight: 2 },
      { phrase: "next steps", weight: 3 },
    ],
  },
  {
    category: "ASSESSMENT",
    keywords: [
      { phrase: "assessment", weight: 5 },
      { phrase: "coding challenge", weight: 5 },
      { phrase: "oa", weight: 3 },
      { phrase: "take-home", weight: 4 },
      { phrase: "next steps", weight: 2 },
    ],
  },
  {
    category: "OFFER",
    keywords: [
      { phrase: "offer", weight: 6 },
      { phrase: "compensation", weight: 2 },
      { phrase: "salary", weight: 2 },
    ],
  },
  {
    category: "REJECTION",
    keywords: [
      { phrase: "rejected", weight: 6 },
      { phrase: "unfortunately", weight: 4 },
      { phrase: "not selected", weight: 5 },
      { phrase: "regret to inform", weight: 5 },
    ],
  },
  {
    category: "RECRUITER",
    keywords: [
      { phrase: "recruiter", weight: 5 },
      { phrase: "talent acquisition", weight: 4 },
      { phrase: "hiring manager", weight: 3 },
      { phrase: "next steps", weight: 2 },
    ],
  },
];

const MIN_CONFIDENCE = 0.45;

export function createGmailClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: accessToken,
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

function hasExcludedKeyword(text: string) {
  return EXCLUDED_KEYWORDS.some((keyword) => text.includes(keyword));
}

function scoreCategory(
  text: string,
  category: Exclude<GmailMessageCategory, "OTHER">,
) {
  const rule = CATEGORY_RULES.find((entry) => entry.category === category);

  if (!rule) {
    return 0;
  }

  return rule.keywords.reduce(
    (score, keyword) =>
      score + (text.includes(keyword.phrase) ? keyword.weight : 0),
    0,
  );
}

function classifyEmail(subject: string, from: string, snippet: string) {
  const combinedText = getCombinedText(subject, from, snippet);

  if (hasExcludedKeyword(combinedText)) {
    return null;
  }

  const scoredCategories = CATEGORY_RULES.map((rule) => ({
    category: rule.category,
    score: scoreCategory(combinedText, rule.category),
  })).sort((left, right) => right.score - left.score);

  const bestMatch = scoredCategories[0];
  const secondBest = scoredCategories[1]?.score ?? 0;

  if (!bestMatch || bestMatch.score <= 0) {
    return null;
  }

  const confidence = bestMatch.score / (bestMatch.score + secondBest + 2);

  if (confidence < MIN_CONFIDENCE) {
    return null;
  }

  return {
    category: bestMatch.category,
    confidence,
  };
}

async function fetchRecentJobEmails(accessToken: string) {
  const gmail = createGmailClient(accessToken);

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    maxResults: 15,
    q: GMAIL_QUERY,
  });

  const messages = listResponse.data.messages ?? [];

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
      const classification = classifyEmail(subject, from, snippet);

      if (!classification) {
        return null;
      }

      return {
        id: message.id,
        threadId: message.threadId,
        subject,
        from,
        snippet,
        date: getHeaderValue(headers, "Date") || new Date().toISOString(),
        category: classification.category,
        confidence: classification.confidence,
      } satisfies GmailMessage;
    }),
  );

  return detailedMessages.filter(
    (message): message is GmailMessage => !!message,
  );
}

const cachedGetRecentJobEmails = unstable_cache(
  async (accessToken: string) => fetchRecentJobEmails(accessToken),
  ["recent-job-emails"],
  {
    revalidate: 60,
  },
);

export async function getRecentJobEmails(accessToken: string) {
  return cachedGetRecentJobEmails(accessToken);
}
