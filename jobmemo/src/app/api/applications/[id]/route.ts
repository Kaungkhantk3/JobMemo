import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: {
    id: string;
  };
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();

    const updatedApplication = await prisma.application.update({
      where: {
        id: params.id,
      },
      data: {
        ...body,
        appliedAt: body.appliedAt ? new Date(body.appliedAt) : undefined,
      },
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await prisma.application.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({
      message: "Application deleted",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 },
    );
  }
}
