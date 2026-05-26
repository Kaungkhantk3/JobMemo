"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { ApplicationsTable } from "@/components/applications/applications-table";
import { mergeApplicationRecords } from "@/lib/applications";
import type { Application } from "@/types/application";
import { GmailSyncSkeleton } from "@/components/gmail/gmail-sync-skeleton";

const GmailSyncClient = dynamic(
  () => import("@/components/gmail/gmail-sync-client"),
  {
    loading: () => <GmailSyncSkeleton showStatusSkeleton />,
  },
);

export function DashboardContent({
  applications: initialApplications,
}: {
  applications: Application[];
}) {
  const [applications, setApplications] = useState(initialApplications);

  function upsertApplication(application: Application) {
    setApplications((current) => mergeApplicationRecords(current, application));
  }

  return (
    <div className="space-y-4">
      <GmailSyncClient onApplicationTracked={upsertApplication} />

      <ApplicationsTable applications={applications} />
    </div>
  );
}
