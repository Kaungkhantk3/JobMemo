import { google } from "googleapis";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "No session" }, { status: 401 });
  }

  const googleAccounts = await prisma.account.findMany({
    where: { userId: session.user.id, provider: "google" },
  });

  const results = await Promise.all(
    googleAccounts.map(async (account) => {
      const summary = {
        id: account.id,
        providerAccountId: account.providerAccountId,
        scope: account.scope,
        hasAccessToken: !!account.access_token,
        hasRefreshToken: !!account.refresh_token,
        profileSuccess: false,
        profileEmail: null as string | null,
        messagesTotal: null as number | null,
      };

      if (!account.access_token) return summary;

      try {
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: account.access_token });
        const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        const profile = await gmail.users.getProfile({ userId: "me" });

        summary.profileSuccess = true;
        summary.profileEmail = profile.data.emailAddress ?? null;
        summary.messagesTotal = profile.data.messagesTotal ?? null;
      } catch (e) {
        // keep profileSuccess false
        console.error("gmail-accounts check failed for account", account.id, e);
      }

      return summary;
    }),
  );

  return Response.json({ results });
}
