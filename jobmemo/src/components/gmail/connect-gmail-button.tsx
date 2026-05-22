"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

type ConnectGmailButtonProps = {
  label: string;
  callbackUrl?: string;
};

export function ConnectGmailButton({
  label,
  callbackUrl = "/gmail",
}: ConnectGmailButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  function closeModal() {
    if (loading) {
      return;
    }

    setOpen(false);
    setConfirmed(false);
  }

  function continueToGoogle() {
    setLoading(true);
    void signIn(
      "google",
      {
        callbackUrl,
      },
      {
        prompt: "consent",
        access_type: "offline",
        response_type: "code",
        include_granted_scopes: "true",
        scope:
          "openid email profile https://www.googleapis.com/auth/gmail.readonly",
      },
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f1117] px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#171a22] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Connecting..." : label}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Gmail consent
                </p>
                <h2 className="mt-2 text-[20px] font-semibold text-zinc-950">
                  Connect Gmail read-only access?
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close consent dialog"
                onClick={closeModal}
                className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <p className="mt-3 text-[14px] leading-6 text-zinc-600">
              JobMemo will request permission to read Gmail messages so it can
              detect job application updates, interviews, assessments,
              rejections, and offers. JobMemo will not send, delete, or modify
              your emails.
            </p>

            <ul className="mt-4 space-y-2 text-[13px] leading-6 text-zinc-600">
              <li>• Read-only access only</li>
              <li>• We only process job-related email metadata/snippets</li>
              <li>• We do not send or delete emails</li>
              <li>• You can disconnect anytime from your Google Account</li>
              <li>
                • Avoid connecting if you are not comfortable granting Gmail
                access
              </li>
            </ul>

            <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-6 text-zinc-700">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                />
                <span>
                  I understand JobMemo will request read-only Gmail access.
                </span>
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!confirmed || loading}
                onClick={continueToGoogle}
                className="inline-flex items-center justify-center rounded-lg bg-[#0f1117] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#171a22] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continue to Google
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-[12px] text-zinc-500">
              <span>Review our privacy and terms before connecting.</span>
              <span className="flex items-center gap-2">
                <Link className="hover:text-zinc-900" href="/privacy">
                  Privacy
                </Link>
                <span>•</span>
                <Link className="hover:text-zinc-900" href="/terms">
                  Terms
                </Link>
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
