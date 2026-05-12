"use client";

import { useState } from "react";
import { Application, ApplicationStatus } from "@/types/application";
import { StatusBadge } from "./status-badge";
import { DeleteApplicationButton } from "./delete-application-button";
import { ApplicationForm } from "./application-form";

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

  return (
    <>
      {/* Stats — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2.5 mb-4 md:mb-5">
        {[
          { label: "Total", value: total, sub: "all time" },
          {
            label: "Interviews",
            value: interviews,
            sub: `${interviewRate}% rate`,
            valueColor: "text-[#27500A]",
          },
          {
            label: "Offers",
            value: offers,
            sub: "received",
            valueColor: "text-[#0F6E56]",
          },
          { label: "Pending", value: pending, sub: "applied + ghosted" },
        ].map(({ label, value, sub, valueColor }) => (
          <div
            key={label}
            className="bg-white border border-zinc-200/80 rounded-lg px-3 py-3 md:px-4 md:py-3.5"
          >
            <p className="text-[11px] text-zinc-400 mb-1">{label}</p>
            <p
              className={`text-[20px] md:text-[22px] font-medium leading-none ${valueColor ?? "text-zinc-900"}`}
            >
              {value}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="w-full pl-8 pr-3 py-2 border border-zinc-200 rounded-md text-[13px] outline-none focus:border-zinc-400 bg-white"
            placeholder="Search company or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          {/* Filter */}
          <select
            className="flex-1 sm:flex-none px-3 py-2 border border-zinc-200 rounded-md text-[13px] bg-white outline-none focus:border-zinc-400"
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
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0f1117] text-white rounded-md text-[13px] font-medium hover:opacity-85 transition-opacity whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="bg-white border border-zinc-200/80 rounded-lg py-12 text-center text-zinc-400 text-[13px]">
            No applications found
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
                    {app.position}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <div className="text-[11px] text-zinc-400 space-y-0.5">
                  <p>Applied: {fmtDate(app.appliedAt)}</p>
                  {app.notes && (
                    <p className="truncate max-w-[200px]">{app.notes}</p>
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
                <td
                  colSpan={6}
                  className="py-12 text-center text-zinc-400 text-[13px]"
                >
                  No applications found
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
                    {app.position}
                  </td>
                  <td className="px-3.5 py-3">
                    <StatusBadge status={app.status} />
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
