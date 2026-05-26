"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import type { Application } from "@/types/application";
import type { GmailMessage } from "@/types/gmail";

import { ConnectGmailButton } from "./connect-gmail-button";
import { GmailDashboardSection } from "./gmail-dashboard-section";
import GmailSyncSkeleton from "./gmail-sync-skeleton";

type GmailSyncResponse = {
  inboxEmails?: GmailMessage[];
  sentEmails?: GmailMessage[];
  inboxError?: string;
  sentError?: string;
  syncedAtLabel?: string;
  error?: string;
};

type GmailReviewsResponse = {
  canSync?: boolean;
  reviewCount?: number;
  lastSyncAt?: string | null;
  lastSyncAtLabel?: string;
  shouldAutoSync?: boolean;
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
  const [syncData, setSyncData] = useState<GmailSyncResponse | null>(null);
  const [reviewsMeta, setReviewsMeta] = useState<GmailReviewsResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [autoSyncAttempted, setAutoSyncAttempted] = useState(false);

  const lastSyncAtLabel = useMemo(
    () => reviewsMeta?.lastSyncAtLabel ?? "Never synced",
    [reviewsMeta?.lastSyncAtLabel],
  );

  const refreshReviewsCache = useCallback(async () => {
    const response = await fetch("/api/gmail/reviews", {
      cache: "no-store",
    });

    const payload = (await response
      .json()
      .catch(() => ({}))) as GmailReviewsResponse;

    if (!response.ok) {
      throw new Error(payload.error || "Unable to load Gmail cache.");
    }

    setReviewsMeta(payload);
    return payload;
  }, []);

  const runSync = useCallback(async () => {
    if (syncing) {
      return;
    }

    setSyncing(true);

    try {
      const response = await fetch("/api/gmail/sync", {
        cache: "no-store",
      });

      const payload = (await response
        .json()
        .catch(() => ({}))) as GmailSyncResponse;

      if (!response.ok) {
        throw new Error(payload.error || "Unable to sync Gmail messages.");
      }

      setSyncData(payload);
      await refreshReviewsCache();
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to sync Gmail messages.",
      );
    } finally {
      setSyncing(false);
      setBootstrapping(false);
    }
  }, [refreshReviewsCache, syncing]);

  useEffect(() => {
    const controller = new AbortController();

    async function bootstrap() {
      try {
        const response = await fetch("/api/gmail/reviews", {
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await response
          .json()
          .catch(() => ({}))) as GmailReviewsResponse;

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load Gmail cache.");
        }

        setReviewsMeta(payload);
        setError(null);
      } catch (loadError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load Gmail cache.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setBootstrapping(false);
        }
      }
    }

    void bootstrap();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!reviewsMeta) {
      return;
    }

    if (autoSyncAttempted || syncing) {
      return;
    }

    if (!reviewsMeta.canSync || reviewsMeta.shouldAutoSync === false) {
      return;
    }

    const timer = window.setTimeout(() => {
      setAutoSyncAttempted(true);
      void runSync();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [autoSyncAttempted, reviewsMeta, runSync, syncing]);

  const loading = bootstrapping || (syncing && !syncData);

  if (error && !syncData && !reviewsMeta) {
    return (
      <GmailSyncError message={error || "Unable to load Gmail messages."} />
    );
  }

  if (loading) {
    return <GmailSyncSkeleton showStatusSkeleton={showStatusSkeleton} />;
  }

  return (
    <GmailDashboardSection
      inboxEmails={syncData?.inboxEmails ?? []}
      sentEmails={syncData?.sentEmails ?? []}
      inboxError={syncData?.inboxError ?? error ?? undefined}
      sentError={syncData?.sentError ?? error ?? undefined}
      syncedAtLabel={syncData?.syncedAtLabel ?? lastSyncAtLabel}
      loading={loading}
      syncing={syncing}
      onSyncGmail={runSync}
      onApplicationTracked={onApplicationTracked}
    />
  );
}
