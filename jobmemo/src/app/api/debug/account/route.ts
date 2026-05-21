import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({
      error: "No session",
    });
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  return Response.json({
    hasAccount: !!account,
    provider: account?.provider,
    scope: account?.scope,
    hasAccessToken: !!account?.access_token,
    hasRefreshToken: !!account?.refresh_token,
    expires_at: account?.expires_at,
  });
}
