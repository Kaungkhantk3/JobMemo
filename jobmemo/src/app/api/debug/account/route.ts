import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function summarizeAccount(account: {
  id: string;
  provider: string;
  providerAccountId: string;
  scope: string | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_at: number | null;
}) {
  return {
    id: account.id,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    scope: account.scope,
    hasAccessToken: !!account.access_token,
    hasRefreshToken: !!account.refresh_token,
    expires_at: account.expires_at,
  };
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({
      error: "No session",
    });
  }

  const googleAccounts = await prisma.account.findMany({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  const account =
    googleAccounts.find((entry) => entry.scope?.includes("gmail.readonly")) ??
    googleAccounts.find((entry) =>
      entry.scope?.includes("https://www.googleapis.com/auth/gmail.readonly"),
    ) ??
    googleAccounts[0] ??
    null;

  return Response.json({
    hasAccount: !!account,
    selectedAccount: account ? summarizeAccount(account) : null,
    googleAccounts: googleAccounts.map(summarizeAccount),
  });
}
