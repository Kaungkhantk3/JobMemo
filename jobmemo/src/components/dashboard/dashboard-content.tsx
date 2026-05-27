"use client";

import { useEffect, useState } from "react";

import { ApplicationsTable } from "@/components/applications/applications-table";
import { mergeApplicationRecords } from "@/lib/applications";
import type { Application } from "@/types/application";
import GmailSuggestionsClient from "@/components/gmail/gmail-suggestions-client";

export function DashboardContent({
  applications: initialApplications,
}: {
  applications: Application[];
}) {
  const [applications, setApplications] = useState(initialApplications);

  useEffect(() => {
    console.log("DashboardClient mounted", performance.now());
  }, []);

  function upsertApplication(application: Application) {
    setApplications((current) => mergeApplicationRecords(current, application));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-950">
            Job Applications
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Track all applications from manual entries and Gmail suggestions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const el = document.querySelector(
                '[aria-label="Add Application"]',
              );
              if (el) (el as HTMLElement).click();
            }}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-white text-sm transition-smooth hover:bg-zinc-800"
          >
            + Add Application
          </button>
        </div>
      </div>

      <GmailSuggestionsClient onApplicationTracked={upsertApplication} />

      <ApplicationsTable applications={applications} />
    </div>
  );
}
