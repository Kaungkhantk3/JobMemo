import { google } from "googleapis";
import { unstable_cache } from "next/cache";

import type { GmailMessage } from "@/types/gmail";

const GMAIL_QUERY =
  "(category:primary OR category:updates) (application OR interview OR recruiter OR job OR offer)";

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

      return {
        id: message.id,
        threadId: message.threadId,
        subject: getHeaderValue(headers, "Subject") || "No subject",
        from: getHeaderValue(headers, "From") || "Unknown sender",
        snippet: messageResponse.data.snippet ?? "",
        date: getHeaderValue(headers, "Date") || new Date().toISOString(),
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
