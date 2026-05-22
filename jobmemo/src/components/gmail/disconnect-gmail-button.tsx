"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DisconnectGmailButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function disconnectGmail() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gmail/disconnect", {
        method: "POST",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(payload?.error ?? "Failed to disconnect Gmail");
      }

      setOpen(false);
      router.refresh();
    } catch (disconnectError) {
      setError(
        disconnectError instanceof Error
          ? disconnectError.message
          : "Failed to disconnect Gmail",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-[13px] font-medium text-rose-700 transition-colors hover:bg-rose-100"
      >
        Disconnect Gmail
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl md:p-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Disconnect Gmail
            </p>
            <h2 className="mt-2 text-[20px] font-semibold text-zinc-950">
              Remove Gmail access from JobMemo?
            </h2>
            <p className="mt-3 text-[14px] leading-6 text-zinc-600">
              This will delete your Google Account connection row for JobMemo.
              You can reconnect later, but Gmail sync will stop until you do.
            </p>
            <p className="mt-3 text-[13px] leading-6 text-zinc-500">
              Your JobMemo user account will remain intact.
            </p>

            {error ? (
              <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => void disconnectGmail()}
                className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Disconnecting..." : "Disconnect Gmail"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
