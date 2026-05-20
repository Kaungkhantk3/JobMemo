export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ApplicationsTable } from "@/components/applications/applications-table";

export default async function DashboardPage() {
  const applications = await prisma.application.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="hidden md:flex items-center bg-white border-b border-zinc-200 px-6 py-3.5">
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
