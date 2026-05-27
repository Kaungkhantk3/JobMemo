"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { ApplicationForm } from "@/components/applications/application-form";
import { ApplicationsTable } from "@/components/applications/applications-table";
import { mergeApplicationRecords } from "@/lib/applications";
import type { DashboardApplication } from "@/types/dashboard";

const GmailSuggestionsPanel = dynamic(
  () => import("@/components/gmail/gmail-suggestions-panel"),
  {
    ssr: false,
    loading: () => (
      <section className="card-base p-4 shadow-sm">
        <div className="h-4 w-36 animate-pulse rounded bg-zinc-200" />
        <div className="mt-3 h-20 rounded-2xl bg-zinc-100" />
        <div className="mt-3 h-20 rounded-2xl bg-zinc-100" />
      </section>
    ),
  },
);

export function DashboardContent({
  applications: initialApplications,
}: {
  applications: DashboardApplication[];
}) {
  const [trackedApplications, setTrackedApplications] = useState<
    DashboardApplication[]
  >([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<DashboardApplication | null>(null);

  const applications = useMemo(
    () =>
      trackedApplications.reduce(
        (current, application) => mergeApplicationRecords(current, application),
        initialApplications,
      ),
    [initialApplications, trackedApplications],
  );

  function upsertApplication(application: DashboardApplication) {
    setTrackedApplications((current) =>
      mergeApplicationRecords(current, application),
    );
  }

  function handleAddApplication() {
    setEditingApplication(null);
    setFormOpen(true);
  }

  function handleEditApplication(application: DashboardApplication) {
    setEditingApplication(application);
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
    setEditingApplication(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-600">
          Track all applications from manual entries and Gmail suggestions.
        </p>
      </div>

      <GmailSuggestionsPanel onApplicationTracked={upsertApplication} />

      <ApplicationsTable
        applications={applications}
        onAddApplication={handleAddApplication}
        onEditApplication={handleEditApplication}
      />

      <ApplicationForm
        open={formOpen}
        onClose={handleCloseForm}
        editing={editingApplication}
      />
    </div>
  );
}
