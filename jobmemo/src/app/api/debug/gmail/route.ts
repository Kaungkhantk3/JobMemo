import { google } from "googleapis";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "No session" }, { status: 401 });
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    return Response.json({
      error: "No access token",
      account: {
        provider: account?.provider ?? null,
        scope: account?.scope ?? null,
        hasAccessToken: false,
        hasRefreshToken: !!account?.refresh_token,
      },
    });
  }

  const oauth2Client = new google.auth.OAuth2();

  oauth2Client.setCredentials({
    access_token: account.access_token,
  });

  const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  try {
    const profile = await gmail.users.getProfile({
      userId: "me",
    });

    return Response.json({
      success: true,
      email: profile.data.emailAddress,
      messagesTotal: profile.data.messagesTotal,
      threadsTotal: profile.data.threadsTotal,
      scope: account.scope,
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      success: false,
      error,
      scope: account.scope,
    });
  }
}
