"use client";

import { useState } from "react";

import { ApplicationsTable } from "@/components/applications/applications-table";
import { mergeApplicationRecords } from "@/lib/applications";
import type { Application } from "@/types/application";
import type { GmailMessage } from "@/types/gmail";

import { GmailDashboardSection } from "@/components/gmail/gmail-dashboard-section";

export function DashboardContent({
  applications: initialApplications,
  inboxEmails,
  sentEmails,
  inboxError,
  sentError,
  syncedAtLabel,
}: {
  applications: Application[];
  inboxEmails: GmailMessage[];
  sentEmails: GmailMessage[];
  inboxError?: string;
  sentError?: string;
  syncedAtLabel: string;
}) {
  const [applications, setApplications] = useState(initialApplications);

  function upsertApplication(application: Application) {
    setApplications((current) => mergeApplicationRecords(current, application));
  }

  return (
    <div className="space-y-4">
      <GmailDashboardSection
        inboxEmails={inboxEmails}
        sentEmails={sentEmails}
        inboxError={inboxError}
        sentError={sentError}
        syncedAtLabel={syncedAtLabel}
        onApplicationTracked={upsertApplication}
      />

      <ApplicationsTable applications={applications} />
    </div>
  );
}
