export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { DashboardApplication } from "@/types/dashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      gmailEmailReviews: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });

  const dashboardApplications: DashboardApplication[] = applications.map(
    (application) => {
      const { gmailEmailReviews, ...applicationFields } = application;

      return {
        ...applicationFields,
        jobUrl: applicationFields.jobUrl ?? null,
        notes: applicationFields.notes ?? null,
        appliedAt: applicationFields.appliedAt?.toISOString() ?? null,
        createdAt: applicationFields.createdAt.toISOString(),
        updatedAt: applicationFields.updatedAt.toISOString(),
        source: gmailEmailReviews.length > 0 ? "Gmail" : "Manual",
      };
    },
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-linear-to-br from-zinc-50 to-white">
      <header className="shrink-0 border-b border-zinc-200/80 bg-white/70 px-3 py-4 backdrop-blur md:px-6 md:py-4">
        <h1 className="text-[20px] font-semibold tracking-tight text-zinc-950 md:text-[24px]">
          Job Applications
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5">
        <DashboardContent
          applications={JSON.parse(JSON.stringify(dashboardApplications))}
        />
      </div>
    </div>
  );
}
