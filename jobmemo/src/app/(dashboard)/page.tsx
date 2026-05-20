export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationsTable } from "@/components/applications/applications-table";
import { redirect } from "next/navigation";

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
      <div className="hidden md:flex items-center border-b border-zinc-200/80 bg-white/70 px-6 py-3.5 backdrop-blur">
        <h1 className="text-[15px] font-medium text-zinc-900">Applications</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5">
        <ApplicationsTable
          applications={JSON.parse(JSON.stringify(applications))}
        />
      </div>
    </div>
  );
}
