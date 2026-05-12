"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
} from "@/types/application";

const STATUSES: ApplicationStatus[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "ASSESSMENT",
  "REJECTED",
  "OFFER",
  "GHOSTED",
];

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Application | null;
}

const empty: CreateApplicationInput = {
  company: "",
  position: "",
  jobUrl: "",
  status: "APPLIED",
  notes: "",
  appliedAt: new Date().toISOString().split("T")[0],
};

export function ApplicationForm({ open, onClose, editing }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CreateApplicationInput>(empty);
  const [loading, setLoading] = useState(false);
  const [dupWarning, setDupWarning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editing) {
      setForm({
        company: editing.company,
        position: editing.position,
        jobUrl: editing.jobUrl ?? "",
        status: editing.status,
        notes: editing.notes ?? "",
        appliedAt: editing.appliedAt
          ? new Date(editing.appliedAt).toISOString().split("T")[0]
          : "",
      });
    } else {
      setForm(empty);
    }
    setDupWarning(false);
    setError("");
  }, [editing, open]);

  function set(field: keyof CreateApplicationInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function checkDuplicate(company: string, position: string) {
    if (!company || !position) {
      setDupWarning(false);
      return;
    }
    const res = await fetch(
      `/api/applications?company=${encodeURIComponent(company)}&position=${encodeURIComponent(position)}`,
    );
    const data = await res.json();
    const match = (data.applications ?? []).find(
      (a: Application) =>
        a.id !== editing?.id &&
        a.company.toLowerCase() === company.toLowerCase() &&
        a.position.toLowerCase() === position.toLowerCase(),
    );
    setDupWarning(!!match);
  }

  async function handleSubmit() {
    if (!form.company.trim() || !form.position.trim()) {
      setError("Company and position are required.");
      return;
    }
    if (dupWarning) return;
    setLoading(true);
    setError("");
    try {
      const url = editing
        ? `/api/applications/${editing.id}`
        : "/api/applications";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          appliedAt: form.appliedAt || null,
          jobUrl: form.jobUrl || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();

        if (res.status === 409) {
          toast.error("You already applied to this role");
          setDupWarning(true);
          return;
        }

        toast.error(data.error || "Something went wrong");
        setError(data.error || "Something went wrong");
        return;
      }
      toast.success(editing ? "Application updated" : "Application created");
      router.refresh();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl border border-zinc-200 w-[440px] max-w-[95vw] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium text-zinc-900">
            {editing ? "Edit Application" : "New Application"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded text-zinc-400 hover:text-zinc-700"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-zinc-500">
              Company *
            </label>
            <input
              className="px-2.5 py-2 border border-zinc-200 rounded-md text-[13px] outline-none focus:border-zinc-400"
              value={form.company}
              onChange={(e) => {
                set("company", e.target.value);
                checkDuplicate(e.target.value, form.position);
              }}
              placeholder="e.g. Stripe"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-zinc-500">
              Position *
            </label>
            <input
              className="px-2.5 py-2 border border-zinc-200 rounded-md text-[13px] outline-none focus:border-zinc-400"
              value={form.position}
              onChange={(e) => {
                set("position", e.target.value);
                checkDuplicate(form.company, e.target.value);
              }}
              placeholder="e.g. Software Engineer"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-zinc-500">
              Status
            </label>
            <select
              className="px-2.5 py-2 border border-zinc-200 rounded-md text-[13px] outline-none focus:border-zinc-400 bg-white"
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-zinc-500">
              Applied Date
            </label>
            <input
              type="date"
              className="px-2.5 py-2 border border-zinc-200 rounded-md text-[13px] outline-none focus:border-zinc-400"
              value={form.appliedAt ?? ""}
              onChange={(e) => set("appliedAt", e.target.value)}
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[12px] font-medium text-zinc-500">
              Job URL
            </label>
            <input
              type="url"
              className="px-2.5 py-2 border border-zinc-200 rounded-md text-[13px] outline-none focus:border-zinc-400"
              value={form.jobUrl ?? ""}
              onChange={(e) => set("jobUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-[12px] font-medium text-zinc-500">
              Notes
            </label>
            <textarea
              className="px-2.5 py-2 border border-zinc-200 rounded-md text-[13px] outline-none focus:border-zinc-400 resize-y min-h-[60px]"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Resume version, recruiter name, referral..."
            />
          </div>
        </div>

        {dupWarning && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-[12px] text-amber-800">
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
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            You already applied to this role.
          </div>
        )}

        {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] border border-zinc-200 rounded-md text-zinc-600 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || dupWarning}
            className="px-4 py-2 text-[13px] bg-[#0f1117] text-white rounded-md font-medium hover:opacity-85 disabled:opacity-50"
          >
            {loading
              ? editing
                ? "Updating..."
                : "Creating..."
              : editing
                ? "Update Application"
                : "Save Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
