import { auth } from "@/auth";
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
        company: body.company,
        position: body.position,
        jobUrl: body.jobUrl || null,
        notes: body.notes || null,
        status: body.status,
        appliedAt: body.appliedAt ? new Date(body.appliedAt) : null,
      },
    });

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
