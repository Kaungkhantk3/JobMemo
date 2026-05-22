import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deleted = await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: "google",
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to disconnect Gmail" },
      { status: 500 },
    );
  }
}
