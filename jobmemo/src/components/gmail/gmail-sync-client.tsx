"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

import { ConnectGmailButton } from "./connect-gmail-button";

type GmailReviewsResponse = {
  canSync?: boolean;
  reviewCount?: number;
  lastSyncAt?: string | null;
  lastSyncAtLabel?: string;
  error?: string;
};

function GmailSyncError({ message }: { message: string }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          Gmail sync
        </div>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-zinc-950 md:text-xl">
          Gmail settings could not load
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
  showStatusSkeleton = true,
}: {
  showStatusSkeleton?: boolean;
}) {
  const [reviewsMeta, setReviewsMeta] = useState<GmailReviewsResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const lastSyncAtLabel = reviewsMeta?.lastSyncAtLabel ?? "Never synced";

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

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to sync Gmail messages.");
      }

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
      }
    }

    void bootstrap();

    return () => controller.abort();
  }, []);

  if (error && !reviewsMeta) {
    return (
      <GmailSyncError message={error || "Unable to load Gmail settings."} />
    );
  }

  if (!reviewsMeta && showStatusSkeleton) {
    return (
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="px-5 py-5 md:px-6">
          <div className="h-4 w-36 animate-pulse rounded bg-zinc-200" />
          <div className="mt-4 h-6 w-56 animate-pulse rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-zinc-100" />
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-label-xs mb-2">Gmail sync</p>
            <h2 className="text-heading-sm text-zinc-950 md:text-heading">
              Gmail connection and sync status
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
              Use Gmail read-only sync to refresh suggestions when you want to.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-zinc-900 p-3 text-white md:block">
            <RefreshCcw className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            Last synced {lastSyncAtLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            {reviewsMeta?.reviewCount ?? 0} review records
          </span>
          <button
            type="button"
            onClick={() => void runSync()}
            disabled={syncing || !reviewsMeta?.canSync}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] font-medium text-zinc-700 shadow-sm transition-smooth hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw
              className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync Gmail"}
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 md:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 shadow-sm">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            Gmail access
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            JobMemo uses read-only Gmail access to detect job application
            updates. We cannot send, delete, or modify your emails.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ConnectGmailButton label="Connect Gmail" />
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm">
            <p className="font-medium">Unable to refresh Gmail metadata.</p>
            <p className="mt-1 text-[13px] leading-6 text-amber-800/90">
              {error}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
