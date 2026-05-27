"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { BriefcaseBusiness, Plus, Search, SearchX } from "lucide-react";

import type { ApplicationStatus } from "@/types/application";
import type { DashboardApplication } from "@/types/dashboard";

import { StatusBadge } from "./status-badge";

const DeleteApplicationButton = dynamic(
  () =>
    import("./delete-application-button").then(
      (mod) => mod.DeleteApplicationButton,
    ),
  {
    ssr: false,
    loading: () => (
      <span className="inline-block h-8 w-8 rounded-lg bg-zinc-100" />
    ),
  },
);

const STATUSES: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "ASSESSMENT",
  "REJECTED",
  "OFFER",
  "GHOSTED",
];

function formatUpdatedAt(updatedAt: string) {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function ApplicationsTable({
  applications,
  onAddApplication,
  onEditApplication,
}: {
  applications: DashboardApplication[];
  onAddApplication: () => void;
  onEditApplication: (application: DashboardApplication) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");

  const filtered = applications.filter((application) => {
    const q = search.toLowerCase();

    return (
      (application.company.toLowerCase().includes(q) ||
        application.position.toLowerCase().includes(q)) &&
      (!statusFilter || application.status === statusFilter)
    );
  });

  const EmptyStateIcon = filtered.length === 0 ? SearchX : BriefcaseBusiness;

  return (
    <section className="space-y-4">
      <div className="card-base p-4 shadow-sm transition-smooth md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-label-xs mb-2">Applications</p>
            <h2 className="text-heading-sm text-zinc-950">
              Tracked applications
            </h2>
            <p className="mt-1 text-body text-zinc-600">
              {applications.length} total applications across manual and Gmail
              sources.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:min-w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                className="input-base pl-9"
                placeholder="Search company or position..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              className="input-base min-w-[150px]"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ApplicationStatus | "")
              }
            >
              <option value="">All Statuses</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onAddApplication}
              style={{ backgroundColor: "var(--color-button-primary)" }}
              className="btn-base whitespace-nowrap px-4 py-2.5 text-body font-medium text-white shadow-sm hover-lift hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Application
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center">
            <div className="mb-4 rounded-xl bg-white p-3 text-zinc-400 shadow-sm">
              <EmptyStateIcon className="h-6 w-6" />
            </div>
            <h3 className="text-heading-sm text-zinc-900">
              No applications yet
            </h3>
            <p className="mt-2 max-w-[240px] text-body text-zinc-500">
              Start by adding your first job application.
            </p>
            <button
              type="button"
              onClick={onAddApplication}
              style={{ backgroundColor: "var(--color-button-primary)" }}
              className="mt-6 btn-base px-4 py-2.5 text-body font-medium text-white shadow-sm hover-lift hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Application
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((application) => (
              <article
                key={application.id}
                className="card-base px-4 py-3.5 transition-smooth hover:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold text-zinc-900">
                      {application.company}
                    </p>
                    <p className="mt-1 truncate text-body-sm text-zinc-500">
                      {application.position}
                    </p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>

                <div className="mt-3 flex items-start justify-between gap-3 border-t border-zinc-100 pt-3">
                  <div className="min-w-0 flex-1 space-y-1 text-body-xs text-zinc-500">
                    <p>Source: {application.source}</p>
                    <p>
                      Last updated: {formatUpdatedAt(application.updatedAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditApplication(application)}
                      aria-label="Edit"
                      className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <DeleteApplicationButton id={application.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm md:block">
        <table className="w-full table-fixed text-body">
          <colgroup>
            <col style={{ width: "24%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "8%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/80">
              {[
                "Company",
                "Position",
                "Status",
                "Source",
                "Last updated",
                "",
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-b border-zinc-200 px-4 py-3 text-left text-label font-semibold"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-xl bg-zinc-50 p-3 text-zinc-400 shadow-sm">
                      <EmptyStateIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-heading-sm text-zinc-900">
                      No applications yet
                    </h3>
                    <p className="mt-2 max-w-xs text-body text-zinc-500">
                      Start by adding your first job application.
                    </p>
                    <button
                      type="button"
                      onClick={onAddApplication}
                      style={{ backgroundColor: "var(--color-button-primary)" }}
                      className="mt-6 btn-base px-4 py-2.5 text-body font-medium text-white shadow-sm hover-lift hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                      Add Application
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((application) => (
                <tr
                  key={application.id}
                  className="border-b border-zinc-100 last:border-0 transition-colors hover:bg-zinc-50/50"
                >
                  <td className="px-4 py-3">
                    <p className="truncate font-semibold text-zinc-900">
                      {application.company}
                    </p>
                  </td>
                  <td className="px-4 py-3 truncate text-zinc-700">
                    {application.position}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={application.status} />
                  </td>
                  <td className="px-4 py-3 text-body-sm text-zinc-500">
                    {application.source}
                  </td>
                  <td className="px-4 py-3 text-body-sm text-zinc-500">
                    {formatUpdatedAt(application.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEditApplication(application)}
                        aria-label="Edit"
                        className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <DeleteApplicationButton id={application.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
