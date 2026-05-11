import { Application } from "@/types/application";
import { ApplicationsTable } from "@/components/applications/applications-table";

async function getApplications(): Promise<Application[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/applications`,
      {
        cache: "no-store",
      },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.applications ?? [];
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const applications = await getApplications();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar */}
      <div className="bg-white border-b border-zinc-200 px-6 py-3.5 flex items-center">
        <h1 className="text-[15px] font-medium text-zinc-900">Applications</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <ApplicationsTable applications={applications} />
      </div>
    </div>
  );
}
