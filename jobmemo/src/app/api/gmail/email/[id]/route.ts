import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/auth";
import {
  applicationEventTitleForStatus,
  applicationEventTypeForStatus,
  applicationStatusFromGmailStatus,
  gmailStatusFromReviewDecision,
  normalizeReviewDecision,
} from "@/lib/applications";
import { createGmailClient } from "@/lib/gmail";
import { prisma } from "@/lib/prisma";
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

type ReviewRequestBody = {
  hidden?: boolean;
  reviewed?: boolean;
  userCorrectedStatus?: GmailJobStatus | null;
  company?: string | null;
  position?: string | null;
  status?: string | null;
  notes?: string | null;
  confidence?: number | null;
  threadId?: string | null;
  emailSubject?: string | null;
  emailDate?: string | null;
};

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
    const body = (await request
      .json()
      .catch(() => null)) as ReviewRequestBody | null;

    if (!body) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const hasUpdate =
      typeof body.hidden === "boolean" ||
      typeof body.reviewed === "boolean" ||
      body.userCorrectedStatus !== undefined ||
      body.company !== undefined ||
      body.position !== undefined ||
      body.status !== undefined ||
      body.notes !== undefined;

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

    const gmailMessage = await gmail.users.messages
      .get({
        userId: "me",
        id,
        format: "metadata",
        metadataHeaders: ["Subject"],
      })
      .catch(() => null);

    if (!gmailMessage?.data) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const subject =
      body.emailSubject ??
      gmailMessage.data.payload?.headers?.find(
        (header) => header.name === "Subject",
      )?.value ??
      null;
    const reviewStatus = normalizeReviewDecision(body.status);
    const applicationStatus =
      reviewStatus === "IGNORE"
        ? null
        : (reviewStatus ??
          applicationStatusFromGmailStatus(body.userCorrectedStatus ?? null));

    const review = await prisma.$transaction(async (tx) => {
      const existingReview = await tx.gmailEmailReview.findUnique({
        where: {
          userId_gmailMessageId: {
            userId: session.user.id,
            gmailMessageId: id,
          },
        },
      });

      const nextReview = await tx.gmailEmailReview.upsert({
        where: {
          userId_gmailMessageId: {
            userId: session.user.id,
            gmailMessageId: id,
          },
        },
        create: {
          userId: session.user.id,
          gmailMessageId: id,
          threadId: body.threadId ?? gmailMessage.data.threadId ?? null,
          company: body.company?.trim() || null,
          role: body.position?.trim() || null,
          status: body.status ?? body.userCorrectedStatus ?? null,
          confidence: body.confidence ?? null,
          hidden: body.hidden ?? false,
          reviewed:
            (body.reviewed ?? body.hidden === true) ||
            body.userCorrectedStatus !== undefined ||
            body.status !== undefined,
          userCorrectedStatus:
            body.userCorrectedStatus === undefined
              ? gmailStatusFromReviewDecision(reviewStatus)
              : body.userCorrectedStatus,
          source: "gmail",
          syncedAt: new Date(),
          notes: body.notes?.trim() || null,
          applicationId: null,
        },
        update: {
          ...(body.threadId !== undefined
            ? { threadId: body.threadId ?? gmailMessage.data.threadId ?? null }
            : {}),
          ...(body.company !== undefined
            ? { company: body.company?.trim() || null }
            : {}),
          ...(body.position !== undefined
            ? { role: body.position?.trim() || null }
            : {}),
          ...(body.status !== undefined ? { status: body.status } : {}),
          ...(body.confidence !== undefined
            ? { confidence: body.confidence }
            : {}),
          ...(body.hidden !== undefined ? { hidden: body.hidden } : {}),
          ...(body.reviewed !== undefined ? { reviewed: body.reviewed } : {}),
          ...(body.userCorrectedStatus !== undefined
            ? { userCorrectedStatus: body.userCorrectedStatus }
            : body.status !== undefined
              ? {
                  userCorrectedStatus:
                    gmailStatusFromReviewDecision(reviewStatus),
                }
              : {}),
          ...(body.notes !== undefined
            ? { notes: body.notes?.trim() || null }
            : {}),
          source: "gmail",
          syncedAt: new Date(),
        },
      });

      let application = null;

      if (
        applicationStatus &&
        reviewStatus !== "IGNORE" &&
        (body.company?.trim() || existingReview?.company) &&
        (body.position?.trim() || existingReview?.role)
      ) {
        const company = (
          body.company?.trim() ||
          existingReview?.company ||
          ""
        ).trim();
        const position = (
          body.position?.trim() ||
          existingReview?.role ||
          ""
        ).trim();
        const appliedAt = body.emailDate ? new Date(body.emailDate) : null;

        const existingApplication = await tx.application.findFirst({
          where: {
            userId: session.user.id,
            company: {
              equals: company,
              mode: "insensitive",
            },
            position: {
              equals: position,
              mode: "insensitive",
            },
          },
        });

        const baseApplicationData = {
          company,
          position,
          notes: body.notes?.trim() || existingApplication?.notes || null,
          status: applicationStatus,
          appliedAt: existingApplication?.appliedAt ?? appliedAt,
          userId: session.user.id,
        };

        if (existingApplication) {
          application = await tx.application.update({
            where: { id: existingApplication.id },
            data: baseApplicationData,
          });
        } else {
          application = await tx.application.create({
            data: baseApplicationData,
          });
        }

        await tx.applicationEvent.create({
          data: {
            applicationId: application.id,
            type: applicationEventTypeForStatus(applicationStatus),
            title: applicationEventTitleForStatus(
              applicationStatus,
              application.company,
              application.position,
            ),
            emailSubject: subject,
          },
        });

        await tx.gmailEmailReview.update({
          where: {
            userId_gmailMessageId: {
              userId: session.user.id,
              gmailMessageId: id,
            },
          },
          data: {
            company,
            role: position,
            status: reviewStatus ?? body.status ?? null,
            applicationId: application.id,
            syncedAt: new Date(),
          },
        });
      }

      return {
        review: nextReview,
        application,
      };
    });

    return NextResponse.json({
      review: {
        hidden: review.review.hidden,
        reviewed: review.review.reviewed,
        userCorrectedStatus: review.review.userCorrectedStatus,
        company: review.review.company,
        role: review.review.role,
        status: review.review.status,
        confidence: review.review.confidence,
        source: review.review.source,
        syncedAt: review.review.syncedAt,
        notes: review.review.notes,
        threadId: review.review.threadId,
        applicationId: review.application?.id ?? review.review.applicationId,
      },
      application: review.application,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update Gmail review" },
      { status: 500 },
    );
  }
}
