import { auth } from "@/auth";
import {
  applicationEventTitleForStatus,
  applicationEventTypeForStatus,
  normalizeApplicationStatus,
} from "@/lib/applications";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const nextStatus = normalizeApplicationStatus(
      body.currentStatus ?? body.status,
    );

    const existing = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id,
      },
      data: {
        company: body.company?.trim() ?? existing.company,
        role: body.role?.trim() ?? body.position?.trim() ?? existing.role,
        position: body.position?.trim() ?? existing.position,
        jobUrl: body.jobUrl || null,
        notes: body.notes || null,
        status: nextStatus ?? existing.status,
        currentStatus: nextStatus ?? existing.currentStatus ?? existing.status,
        source: body.source ?? existing.source,
        appliedAt: body.appliedAt ? new Date(body.appliedAt) : null,
      },
    });

    const statusChanged =
      nextStatus !== null && nextStatus !== existing.currentStatus;

    if (statusChanged) {
      await prisma.applicationEvent.create({
        data: {
          applicationId: updatedApplication.id,
          type: applicationEventTypeForStatus(nextStatus),
          title: applicationEventTitleForStatus(
            nextStatus,
            updatedApplication.company,
            updatedApplication.role || updatedApplication.position,
          ),
        },
      });
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("PATCH /api/applications/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.application.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.application.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Application deleted",
    });
  } catch (error) {
    console.error("DELETE /api/applications/[id] error:", error);

    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 },
    );
  }
}
