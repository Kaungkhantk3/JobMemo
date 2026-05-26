"use client";

import { useState } from "react";

import { ApplicationsTable } from "@/components/applications/applications-table";
import { mergeApplicationRecords } from "@/lib/applications";
import type { Application } from "@/types/application";
import GmailSyncClient from "@/components/gmail/gmail-sync-client";

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
