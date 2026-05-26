"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import type { Application } from "@/types/application";
import type { GmailMessage } from "@/types/gmail";

import { ConnectGmailButton } from "./connect-gmail-button";
import { GmailSyncSkeleton } from "./gmail-sync-skeleton";

const GmailDashboardSection = dynamic(
  () =>
    import("./gmail-dashboard-section").then(
      (module) => module.GmailDashboardSection,
    ),
  {
    loading: () => <GmailSyncSkeleton showStatusSkeleton={false} />,
  },
);

type GmailSyncResponse = {
  inboxEmails?: GmailMessage[];
  sentEmails?: GmailMessage[];
  inboxError?: string;
  sentError?: string;
  syncedAtLabel?: string;
  error?: string;
};

function GmailSyncError({ message }: { message: string }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm">
      <div className="border-b border-zinc-200/80 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          Gmail sync
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">
          Gmail messages could not load
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
          JobMemo will keep the rest of the dashboard available while Gmail is
          retried.
        </p>
      </div>

      <div className="p-5 md:p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm">
          <p className="text-[15px] font-medium">Unable to load Gmail data.</p>
          <p className="mt-1 text-[13px] leading-6 text-amber-800/90">
            {message}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ConnectGmailButton label="Reconnect Gmail" />
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function GmailSyncClient({
  onApplicationTracked,
  showStatusSkeleton = true,
}: {
  onApplicationTracked?: (application: Application) => void;
  showStatusSkeleton?: boolean;
}) {
  const [data, setData] = useState<GmailSyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGmailSync() {
      try {
        const response = await fetch("/api/gmail/sync", {
          signal: controller.signal,
        });

        const payload = (await response
          .json()
          .catch(() => ({}))) as GmailSyncResponse;

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load Gmail messages.");
        }

        setData(payload);
        setError(null);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load Gmail messages.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadGmailSync();

    return () => controller.abort();
  }, []);

  if (loading) {
    return <GmailSyncSkeleton showStatusSkeleton={showStatusSkeleton} />;
  }

  if (error || !data) {
    return (
      <GmailSyncError message={error || "Unable to load Gmail messages."} />
    );
  }

  return (
    <GmailDashboardSection
      inboxEmails={data.inboxEmails ?? []}
      sentEmails={data.sentEmails ?? []}
      inboxError={data.inboxError}
      sentError={data.sentError}
      syncedAtLabel={data.syncedAtLabel ?? "just now"}
      onApplicationTracked={onApplicationTracked}
    />
  );
}
