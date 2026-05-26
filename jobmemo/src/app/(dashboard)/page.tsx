export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

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
  });

  return (
    <div className="flex h-full flex-col overflow-hidden bg-linear-to-br from-zinc-50 to-white">
      <header className="shrink-0 border-b border-zinc-200/80 bg-white/70 px-3 py-4 backdrop-blur md:px-6 md:py-4">
        <h1 className="text-[20px] font-semibold tracking-tight text-zinc-950 md:text-[24px]">
          Dashboard
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5">
        <DashboardContent
          applications={JSON.parse(JSON.stringify(applications))}
        />
      </div>
    </div>
  );
}
