import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createGmailClient } from "@/lib/gmail";
import type { GmailJobStatus } from "@/types/gmail";

const ALLOWED_STATUSES: GmailJobStatus[] = [
  "APPLIED",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "REJECTION",
  "RECRUITER",
  "UNKNOWN",
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json().catch(() => null)) as {
      hidden?: boolean;
      reviewed?: boolean;
      userCorrectedStatus?: GmailJobStatus | null;
    } | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const hasUpdate =
      typeof body.hidden === "boolean" ||
      typeof body.reviewed === "boolean" ||
      body.userCorrectedStatus !== undefined;

    if (!hasUpdate) {
      return NextResponse.json(
        { error: "No review fields provided" },
        { status: 400 },
      );
    }

    if (
      body.userCorrectedStatus !== undefined &&
      body.userCorrectedStatus !== null &&
      !ALLOWED_STATUSES.includes(body.userCorrectedStatus)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google",
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Gmail account not connected" },
        { status: 404 },
      );
    }

    if (!account.access_token && !account.refresh_token) {
      return NextResponse.json(
        { error: "Gmail access unavailable" },
        { status: 403 },
      );
    }

    const gmail = createGmailClient(
      account.access_token,
      account.refresh_token,
    );

    try {
      await gmail.users.messages.get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: ["Subject"],
      });
    } catch {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const review = await prisma.gmailEmailReview.upsert({
      where: {
        userId_gmailMessageId: {
          userId: session.user.id,
          gmailMessageId: id,
        },
      },
      create: {
        userId: session.user.id,
        gmailMessageId: id,
        hidden: body.hidden ?? false,
        reviewed:
          (body.reviewed ?? body.hidden === true) ||
          body.userCorrectedStatus !== undefined,
        userCorrectedStatus:
          body.userCorrectedStatus === undefined
            ? null
            : body.userCorrectedStatus,
      },
      update: {
        ...(body.hidden !== undefined ? { hidden: body.hidden } : {}),
        ...(body.reviewed !== undefined ? { reviewed: body.reviewed } : {}),
        ...(body.userCorrectedStatus !== undefined
          ? { userCorrectedStatus: body.userCorrectedStatus }
          : {}),
      },
    });

    return NextResponse.json({
      review: {
        hidden: review.hidden,
        reviewed: review.reviewed,
        userCorrectedStatus: review.userCorrectedStatus,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update Gmail review" },
      { status: 500 },
    );
  }
}
