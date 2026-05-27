"use client";

import { useState, type ComponentType } from "react";
import { Application, ApplicationStatus } from "@/types/application";
import { StatusBadge } from "./status-badge";
import { DeleteApplicationButton } from "./delete-application-button";
import { ApplicationForm } from "./application-form";
import {
  BriefcaseBusiness,
  Clock3,
  MessageSquareText,
  Plus,
  Search,
  SearchX,
  Trophy,
} from "lucide-react";

const STATUSES: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "ASSESSMENT",
  "REJECTED",
  "OFFER",
  "GHOSTED",
];

function fmtDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ApplicationsTable({
  applications,
}: {
  applications: Application[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [editing, setEditing] = useState<Application | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filtered = applications.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.company.toLowerCase().includes(q) ||
        a.position.toLowerCase().includes(q)) &&
      (!statusFilter || a.status === statusFilter)
    );
  });

  const total = applications.length;
  const interviews = applications.filter(
    (a) => a.status === "INTERVIEW",
  ).length;
  const offers = applications.filter((a) => a.status === "OFFER").length;
  const pending = applications.filter(
    (a) => a.status === "APPLIED" || a.status === "GHOSTED",
  ).length;
  const interviewRate = total ? Math.round((interviews / total) * 100) : 0;

  const stats = [
    {
      label: "Total",
      value: total,
      sub: "all time",
      icon: BriefcaseBusiness,
      iconBg: "bg-slate-900/5",
      iconColor: "text-slate-700",
    },
    {
      label: "Interviews",
      value: interviews,
      sub: `${interviewRate}% rate`,
      icon: MessageSquareText,
      valueColor: "text-[#27500A]",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-700",
    },
    {
      label: "Offers",
      value: offers,
      sub: "received",
      icon: Trophy,
      valueColor: "text-[#0F6E56]",
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-700",
    },
    {
      label: "Pending",
      value: pending,
      sub: "applied + ghosted",
      icon: Clock3,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-700",
    },
  ] satisfies Array<{
    label: string;
    value: number;
    sub: string;
    icon: ComponentType<{ className?: string }>;
    valueColor?: string;
    iconBg: string;
    iconColor: string;
  }>;

  const EmptyStateIcon = filtered.length === 0 ? SearchX : BriefcaseBusiness;

  return (
    <>
      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid-cols-responsive-4 gap-3 mb-6 md:mb-8">
        {stats.map(
          ({
            label,
            value,
            sub,
            valueColor,
            icon: Icon,
            iconBg,
            iconColor,
          }) => (
            <div
              key={label}
              className="card-elevated"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-label-xs mb-2">{label}</p>
                  <p
                    className={`text-2xl md:text-3xl font-semibold leading-none ${valueColor ?? "text-zinc-900"}`}
                  >
                    {value}
                  </p>
                  <p className="text-label-xs mt-2">{sub}</p>
                </div>

                <div className={`rounded-lg p-2.5 ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="input-base pl-9"
            placeholder="Search company or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          {/* Filter */}
          <select
            className="input-base min-w-[150px] sm:min-w-[140px]"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ApplicationStatus | "")
            }
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>

          {/* Add button */}
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            style={{ backgroundColor: "var(--color-button-primary)" }}
            className="btn-base text-white px-4 py-2.5 text-body font-medium shadow-sm hover-lift hover:opacity-90 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center">
            <div className="mb-4 rounded-xl bg-white p-3 text-zinc-400">
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
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              style={{ backgroundColor: "var(--color-button-primary)" }}
              className="mt-6 btn-base text-white px-4 py-2.5 text-body font-medium shadow-sm hover-lift hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Application
            </button>
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app.id}
              className="card-base px-4 py-3.5 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900 text-body truncate">
                    {app.company}
                  </p>
                  <p className="text-zinc-500 text-body-sm truncate mt-1">
                    {app.position}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                <div className="text-body-xs text-zinc-500 space-y-0.5 flex-1 min-w-0">
                  <p>Applied: {fmtDate(app.appliedAt)}</p>
                  {app.notes && (
                    <p className="truncate">{app.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditing(app);
                      setFormOpen(true);
                    }}
                    aria-label="Edit"
                    className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
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
                  <DeleteApplicationButton id={app.id} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-body table-fixed">
          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "6%" }} />
          </colgroup>
          <thead>
            <tr className="bg-zinc-50/80 border-b border-zinc-200">
              {["Company", "Position", "Status", "Applied", "Notes", ""].map(
                (h, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-3 text-label font-semibold border-b border-zinc-200"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-xl bg-zinc-50 p-3 text-zinc-400">
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
                      onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
                      }}
                      style={{ backgroundColor: "var(--color-button-primary)" }}
                      className="mt-6 btn-base text-white px-4 py-2.5 text-body font-medium shadow-sm hover-lift hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                      Add Application
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-zinc-900 truncate">
                      {app.company}
                    </p>
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body-xs text-zinc-400 hover:text-zinc-600 truncate block mt-1"
                      >
                        {app.jobUrl.replace(/^https?:\/\//, "").slice(0, 30)}…
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 truncate">
                    {app.position}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-body-sm">
                    {fmtDate(app.appliedAt)}
                  </td>
                  <td
                    className="px-4 py-3 text-zinc-500 text-body-sm truncate"
                    title={app.notes ?? ""}
                  >
                    {app.notes || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(app);
                          setFormOpen(true);
                        }}
                        aria-label="Edit"
                        className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
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
                      <DeleteApplicationButton id={app.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ApplicationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editing={editing}
      />
    </>
  );
}
