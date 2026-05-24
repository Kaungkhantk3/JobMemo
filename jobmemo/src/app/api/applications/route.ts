import { auth } from "@/auth";
import {
  applicationEventTitleForStatus,
  applicationEventTypeForStatus,
  normalizeApplicationStatus,
} from "@/lib/applications";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { company, position, jobUrl, notes, status, appliedAt } = body;

    if (!company || !position) {
      return NextResponse.json(
        { error: "Company and position are required" },
        { status: 400 },
      );
    }

    const resolvedStatus = normalizeApplicationStatus(status) ?? "APPLIED";

    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        company: {
          equals: company.trim(),
          mode: "insensitive",
        },
        position: {
          equals: position.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "Application already exists" },
        { status: 409 },
      );
    }

    const application = await prisma.application.create({
      data: {
        company: company.trim(),
        position: position.trim(),
        jobUrl,
        notes,
        status: resolvedStatus,
        appliedAt: appliedAt ? new Date(appliedAt) : null,
        userId: session.user.id,
      },
    });

    if (resolvedStatus !== "SAVED") {
      await prisma.applicationEvent.create({
        data: {
          applicationId: application.id,
          type: applicationEventTypeForStatus(resolvedStatus),
          title: applicationEventTitleForStatus(
            resolvedStatus,
            application.company,
            application.position,
          ),
        },
      });
    }

    return NextResponse.json(application, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 },
    );
  }
}
