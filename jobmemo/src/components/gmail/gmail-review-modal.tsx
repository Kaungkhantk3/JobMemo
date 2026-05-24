"use client";

import { useState } from "react";

import {
  applicationStatusFromGmailStatus,
  normalizeReviewDecision,
  type ReviewDecision,
} from "@/lib/applications";
import type { GmailMessage } from "@/types/gmail";

type ReviewFormState = {
  company: string;
  position: string;
  status: ReviewDecision;
  notes: string;
  hideEmail: boolean;
};

const STATUS_OPTIONS: Array<{ value: ReviewDecision; label: string }> = [
  { value: "APPLIED", label: "Applied" },
  { value: "ASSESSMENT", label: "Assessment" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "REJECTED", label: "Rejected" },
  { value: "OFFER", label: "Offer" },
  { value: "IGNORE", label: "Ignore / Not Job Related" },
];

function initialState(email: GmailMessage | null): ReviewFormState {
  return {
    company: email?.company ?? "",
    position: email?.role ?? "",
    status:
      normalizeReviewDecision(email?.status) ??
      applicationStatusFromGmailStatus(email?.userCorrectedStatus ?? null) ??
      "APPLIED",
    notes: email?.notes ?? "",
    hideEmail: !!email?.hidden,
  };
}

export function GmailReviewModal({
  open,
  email,
  submitting = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  email: GmailMessage | null;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (payload: ReviewFormState) => void;
}) {
  const [form, setForm] = useState<ReviewFormState>(() => initialState(email));

  if (!open || !email) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white shadow-2xl">
        <div className="border-b border-zinc-200/80 px-5 py-5 md:px-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Gmail review
          </p>
          <h2 className="mt-2 text-[18px] font-semibold text-zinc-950">
            Confirm the tracked application
          </h2>
          <p className="mt-1 text-[13px] leading-6 text-zinc-600">
            Review the detected company, role, and status before JobMemo creates
            or updates the application record.
          </p>
        </div>

        <div className="space-y-4 px-5 py-5 md:px-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Email subject
            </p>
            <p className="mt-1 text-[14px] font-medium text-zinc-950">
              {email.subject || "(No subject)"}
            </p>
            <p className="mt-1 text-[12px] text-zinc-500">
              {email.company ?? "Unknown company"} ·{" "}
              {email.role ?? "Role not detected"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[12px] font-medium text-zinc-600">
                Company
              </span>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-zinc-400"
                value={form.company}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    company: event.target.value,
                  }))
                }
                placeholder="Company name"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[12px] font-medium text-zinc-600">
                Role
              </span>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-zinc-400"
                value={form.position}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    position: event.target.value,
                  }))
                }
                placeholder="Role title"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <label className="space-y-1.5">
              <span className="text-[12px] font-medium text-zinc-600">
                Status
              </span>
              <select
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-zinc-400"
                value={form.status}
                onChange={(event) => {
                  const nextStatus =
                    normalizeReviewDecision(event.target.value) ?? "APPLIED";
                  setForm((current) => ({
                    ...current,
                    status: nextStatus,
                    hideEmail:
                      nextStatus === "IGNORE" ? true : current.hideEmail,
                  }));
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[12px] font-medium text-zinc-600">
                Notes
              </span>
              <textarea
                className="min-h-[96px] w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-zinc-400"
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                placeholder="Add a recruiter name, link, follow-up notes, or context"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <input
              type="checkbox"
              checked={form.hideEmail}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  hideEmail: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
            />
            <span className="text-[13px] text-zinc-700">
              Hide this email after confirming
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-200/80 px-5 py-4 md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(form)}
            disabled={submitting}
            className="rounded-full bg-zinc-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
