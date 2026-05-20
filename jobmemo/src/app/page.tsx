import { Application } from "@/types/application";
import { ApplicationsTable } from "@/components/applications/applications-table";

async function getApplications(): Promise<Application[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/applications`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    return await res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const applications = await getApplications();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar — desktop only (mobile topbar is in SidebarWrapper) */}
      <div className="hidden md:flex items-center bg-white border-b border-zinc-200 px-6 py-3.5">
        <h1 className="text-[15px] font-medium text-zinc-900">Applications</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-5">
        <ApplicationsTable applications={applications} />
      </div>
    </div>
  );
}
