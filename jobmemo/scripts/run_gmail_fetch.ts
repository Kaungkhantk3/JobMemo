import { prisma } from "../src/lib/prisma";
import { createGmailClient, getRecentJobEmails } from "../src/lib/gmail";

async function main() {
  const account = await prisma.account.findFirst({
    where: { provider: "google" },
    select: {
      id: true,
      userId: true,
      access_token: true,
      refresh_token: true,
      scope: true,
    },
  });

  if (!account) {
    console.log("No google account connected");
    await prisma.$disconnect();
    return;
  }

  console.log("Found account:", {
    id: account.id,
    userId: account.userId,
    scope: account.scope,
  });

  try {
    // Call the non-cached fetch helper directly to avoid Next.js unstable_cache
    const { fetchJobEmails } = await import("../src/lib/gmail");
    const emails = await fetchJobEmails(
      account.access_token,
      account.refresh_token,
      "INBOX_ACTIVITY",
      10,
    );

    console.log(
      "Fetched emails:",
      emails.map((e) => ({
        id: e.id,
        subject: e.subject,
        from: e.from,
        company: e.company,
        role: e.role,
        status: e.status,
        confidence: e.confidence,
        reason: e.reason,
      })),
    );
  } catch (err) {
    console.error("Error fetching emails", err);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
