"use client";

import dynamic from "next/dynamic";
import { type ComponentType, useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Plus,
  RefreshCcw,
  SearchCheck,
  Send,
  TrendingUp,
} from "lucide-react";

import { ApplicationForm } from "@/components/applications/application-form";
import { ApplicationsTable } from "@/components/applications/applications-table";
import { mergeApplicationRecords } from "@/lib/applications";
import type { DashboardApplication, DashboardSummary } from "@/types/dashboard";

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
  summary,
}: {
  applications: DashboardApplication[];
  summary: DashboardSummary;
}) {
  const [trackedApplications, setTrackedApplications] = useState<
    DashboardApplication[]
  >([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<DashboardApplication | null>(null);
  const [syncSignal, setSyncSignal] = useState(0);

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

  function handleSyncGmail() {
    setSyncSignal((current) => current + 1);
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-label-xs mb-2">Dashboard</p>
          <h2 className="text-heading-sm text-zinc-950">Job Applications</h2>
          <p className="mt-1 max-w-2xl text-body text-zinc-600">
            Track what you are applying to right now, then review Gmail
            suggestions and keep the workflow moving from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAddApplication}
            style={{ backgroundColor: "var(--color-button-primary)" }}
            className="btn-base whitespace-nowrap px-4 py-2.5 text-body font-medium text-white shadow-sm hover-lift hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
          <button
            type="button"
            onClick={handleSyncGmail}
            className="btn-base whitespace-nowrap border border-zinc-200 bg-white px-4 py-2.5 text-body font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Sync Gmail
          </button>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Applications"
          value={summary.totalApplications}
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Interviews"
          value={summary.interviews}
          icon={TrendingUp}
        />
        <StatCard
          label="Assessments"
          value={summary.assessments}
          icon={SearchCheck}
        />
        <StatCard label="Offers" value={summary.offers} icon={BadgeCheck} />
        <StatCard
          label="Pending review"
          value={summary.pendingReview}
          icon={Send}
        />
      </section>

      <GmailSuggestionsPanel
        onApplicationTracked={upsertApplication}
        syncSignal={syncSignal}
        limit={8}
      />

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

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="card-base p-4 shadow-sm transition-smooth">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label-xs mb-2">{label}</p>
          <p className="text-3xl font-semibold tracking-tight text-zinc-950">
            {value}
          </p>
        </div>
        <div className="rounded-lg bg-zinc-50 p-2.5 text-zinc-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
