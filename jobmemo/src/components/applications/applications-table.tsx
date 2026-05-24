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
    const role = a.role ?? a.position;
    return (
      (a.company.toLowerCase().includes(q) || role.toLowerCase().includes(q)) &&
      (!statusFilter || (a.currentStatus ?? a.status) === statusFilter)
    );
  });

  const total = applications.length;
  const interviews = applications.filter(
    (a) => (a.currentStatus ?? a.status) === "INTERVIEW",
  ).length;
  const offers = applications.filter(
    (a) => (a.currentStatus ?? a.status) === "OFFER",
  ).length;
  const pending = applications.filter(
    (a) =>
      (a.currentStatus ?? a.status) === "APPLIED" ||
      (a.currentStatus ?? a.status) === "GHOSTED",
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2.5 mb-4 md:mb-5">
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
              className="group rounded-2xl border border-zinc-200/80 bg-white px-3 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:px-4 md:py-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] text-zinc-400 mb-1">{label}</p>
                  <p
                    className={`text-[20px] md:text-[22px] font-medium leading-none ${valueColor ?? "text-zinc-900"}`}
                  >
                    {value}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">{sub}</p>
                </div>

                <div className={`rounded-xl p-2 ${iconBg}`}>
                  <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-[13px] outline-none transition-shadow focus:border-zinc-300 focus:shadow-sm"
            placeholder="Search company or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {/* Filter */}
          <select
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] outline-none transition-shadow focus:border-zinc-300 focus:shadow-sm sm:flex-none"
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
            className="flex items-center gap-2 rounded-lg bg-[#0f1117] px-3.5 py-2 text-[13px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#171a22] hover:shadow-md whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
            <div className="mb-4 rounded-2xl bg-zinc-50 p-3 text-zinc-500">
              <EmptyStateIcon className="h-6 w-6" />
            </div>
            <h3 className="text-[15px] font-medium text-zinc-900">
              No applications yet
            </h3>
            <p className="mt-2 max-w-[240px] text-[13px] leading-5 text-zinc-500">
              Start by adding your first job application.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0f1117] px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#171a22] hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add Application
            </button>
          </div>
        ) : (
          filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white border border-zinc-200/80 rounded-lg px-4 py-3.5"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900 text-[14px] truncate">
                    {app.company}
                  </p>
                  <p className="text-zinc-500 text-[12px] truncate mt-0.5">
                    {app.role ?? app.position}
                  </p>
                </div>
                <StatusBadge status={app.currentStatus ?? app.status} />
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <div className="text-[11px] text-zinc-400 space-y-0.5">
                  <p>Applied: {fmtDate(app.appliedAt)}</p>
                  {app.notes && (
                    <p className="truncate max-w-50">{app.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditing(app);
                      setFormOpen(true);
                    }}
                    aria-label="Edit"
                    className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
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
      <div className="hidden md:block bg-white border border-zinc-200/80 rounded-lg overflow-hidden">
        <table className="w-full text-[13px] table-fixed">
          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "28%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "6%" }} />
          </colgroup>
          <thead>
            <tr className="bg-zinc-50/80">
              {["Company", "Position", "Status", "Applied", "Notes", ""].map(
                (h, i) => (
                  <th
                    key={i}
                    className="text-left px-3.5 py-2.5 text-[11px] font-medium text-zinc-400 uppercase tracking-wide border-b border-zinc-200"
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
                <td colSpan={6} className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-2xl bg-zinc-50 p-3 text-zinc-500">
                      <EmptyStateIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-[15px] font-medium text-zinc-900">
                      No applications yet
                    </h3>
                    <p className="mt-2 max-w-[260px] text-[13px] leading-5 text-zinc-500">
                      Start by adding your first job application.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0f1117] px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#171a22] hover:shadow-md"
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
                  <td className="px-3.5 py-3">
                    <p className="font-medium text-zinc-900 truncate">
                      {app.company}
                    </p>
                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 truncate block"
                      >
                        {app.jobUrl.replace(/^https?:\/\//, "").slice(0, 30)}…
                      </a>
                    )}
                  </td>
                  <td className="px-3.5 py-3 text-zinc-700 truncate">
                    {app.role ?? app.position}
                  </td>
                  <td className="px-3.5 py-3">
                    <StatusBadge status={app.currentStatus ?? app.status} />
                  </td>
                  <td className="px-3.5 py-3 text-zinc-400 text-[12px]">
                    {fmtDate(app.appliedAt)}
                  </td>
                  <td
                    className="px-3.5 py-3 text-zinc-400 text-[12px] truncate"
                    title={app.notes ?? ""}
                  >
                    {app.notes || "—"}
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => {
                          setEditing(app);
                          setFormOpen(true);
                        }}
                        aria-label="Edit"
                        className="p-1.5 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
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
