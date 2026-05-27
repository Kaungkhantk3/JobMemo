"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Mail } from "lucide-react";

import type { Application } from "@/types/application";
import type { DashboardApplication } from "@/types/dashboard";
import type { GmailSuggestion } from "@/types/gmail";

const GmailSuggestionReviewModal = dynamic(
  () =>
    import("./gmail-suggestion-review-modal").then(
      (mod) => mod.GmailSuggestionReviewModal,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

type SuggestionsResponse = {
  suggestions?: GmailSuggestion[];
  error?: string;
};

function SuggestionsSkeleton() {
  return (
    <section className="card-base p-4 shadow-sm">
      <div className="h-4 w-36 animate-pulse rounded bg-zinc-200" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4"
          >
            <div className="h-4 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="mt-3 h-4 w-28 animate-pulse rounded bg-zinc-100" />
            <div className="mt-4 h-9 w-full animate-pulse rounded bg-zinc-200" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function GmailSuggestionsPanel({
  onApplicationTracked,
  syncSignal = 0,
  limit = 8,
}: {
  onApplicationTracked?: (application: DashboardApplication) => void;
  syncSignal?: number;
  limit?: number;
}) {
  const [suggestions, setSuggestions] = useState<GmailSuggestion[] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewingSuggestion, setReviewingSuggestion] =
    useState<GmailSuggestion | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSuggestions = useCallback(
    async (quiet = false) => {
      try {
        if (quiet) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await fetch(`/api/gmail/suggestions?limit=${limit}`, {
          cache: "no-store",
        });

        const payload = (await response
          .json()
          .catch(() => ({}))) as SuggestionsResponse;

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load Gmail suggestions");
        }

        setSuggestions(payload.suggestions ?? []);
        setError(null);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load Gmail suggestions",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [limit],
  );

  const syncSuggestions = useCallback(async () => {
    if (syncing) {
      return;
    }

    setSyncing(true);

    try {
      const response = await fetch("/api/gmail/sync", {
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error || "Failed to sync Gmail");
      }

      await loadSuggestions(true);
    } catch (syncError) {
      setError(
        syncError instanceof Error ? syncError.message : "Failed to sync Gmail",
      );
    } finally {
      setSyncing(false);
    }
  }, [loadSuggestions, syncing]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (syncSignal > 0) {
        void syncSuggestions();
        return;
      }

      void loadSuggestions(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSuggestions, syncSignal, syncSuggestions]);

  const lastSynced = useMemo(() => {
    const latest = suggestions?.[0]?.syncedAt;
    if (!latest) return "Never synced";

    const date = new Date(latest);
    if (Number.isNaN(date.getTime())) return "Never synced";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }, [suggestions]);

  async function mutateSuggestion(
    suggestion: GmailSuggestion,
    payload: {
      company: string;
      position: string;
      notes: string;
      hideEmail: boolean;
      status?: string;
    },
  ) {
    const response = await fetch(`/api/gmail/email/${suggestion.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: payload.company,
        position: payload.position,
        notes: payload.notes,
        hidden: payload.hideEmail,
        reviewed: true,
        status: payload.status ?? suggestion.status ?? "APPLIED",
      }),
    });

    const result = (await response.json().catch(() => null)) as {
      application?: Application | null;
      error?: string;
    } | null;

    if (!response.ok) {
      throw new Error(result?.error || "Failed to update Gmail suggestion");
    }

    if (result?.application) {
      onApplicationTracked?.({
        ...result.application,
        source: "Gmail",
      });
    }

    setSuggestions((current) =>
      (current ?? []).filter((entry) => entry.id !== suggestion.id),
    );
  }

  async function addToApplications(suggestion: GmailSuggestion) {
    setSaving(true);
    try {
      await mutateSuggestion(suggestion, {
        company: suggestion.company ?? "",
        position: suggestion.position ?? "",
        notes: suggestion.notes ?? "",
        hideEmail: false,
        status:
          suggestion.status ?? suggestion.userCorrectedStatus ?? "APPLIED",
      });
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : "Failed to add application",
      );
    } finally {
      setSaving(false);
    }
  }

  async function dismissSuggestion(suggestion: GmailSuggestion) {
    setSaving(true);
    try {
      await mutateSuggestion(suggestion, {
        company: suggestion.company ?? "",
        position: suggestion.position ?? "",
        notes: suggestion.notes ?? "",
        hideEmail: true,
        status: "IGNORE",
      });
    } catch (dismissError) {
      setError(
        dismissError instanceof Error
          ? dismissError.message
          : "Failed to dismiss suggestion",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <SuggestionsSkeleton />;
  }

  return (
    <section className="card-base p-4 shadow-sm transition-smooth">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-label-xs mb-2">Suggested from Gmail</p>
          <h2 className="text-heading-sm text-zinc-950">
            Suggested from Gmail
          </h2>
          <p className="mt-1 text-body text-zinc-600">
            Pending Gmail imports that have not been converted into
            applications.
          </p>
        </div>

        <div className="text-[12px] text-zinc-500">
          Last synced {lastSynced}
        </div>
      </div>

      {syncing || refreshing ? (
        <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-[13px] text-zinc-600">
          {syncing ? "Syncing Gmail..." : "Refreshing Gmail suggestions..."}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm">
            <p className="font-medium">Unable to load Gmail suggestions.</p>
            <p className="mt-1 text-sm leading-6 text-amber-800/90">{error}</p>
          </div>
        ) : suggestions?.length ? (
          suggestions.map((suggestion) => (
            <article
              key={suggestion.id}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 shadow-sm transition-smooth hover:bg-zinc-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-zinc-950 truncate">
                    {suggestion.company ?? "Unknown company"}
                  </p>
                  <p className="mt-1 text-sm font-medium text-zinc-700 truncate">
                    {suggestion.position ?? "Role not detected"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {suggestion.notes ?? "Ready to review and import."}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 shadow-sm">
                    {suggestion.status ?? "Suggestion"}
                  </div>
                  <div className="text-[12px] text-zinc-500">
                    {suggestion.syncedAt
                      ? new Date(suggestion.syncedAt).toLocaleDateString()
                      : "Recently"}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewingSuggestion(suggestion)}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] font-medium text-zinc-700 shadow-sm transition-smooth hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    >
                      <Eye className="h-4 w-4" />
                      Review
                    </button>
                    <button
                      type="button"
                      onClick={() => void addToApplications(suggestion)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] font-medium text-zinc-700 shadow-sm transition-smooth hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Add to Applications
                    </button>
                    <button
                      type="button"
                      onClick={() => void dismissSuggestion(suggestion)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[12px] font-medium text-rose-700 shadow-sm transition-smooth hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 px-6 py-8 text-center shadow-sm">
            <div className="mx-auto mb-3 inline-flex items-center justify-center rounded-full bg-white p-3 text-zinc-500 shadow-sm">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-[14px] font-medium text-zinc-950">
              No new Gmail suggestions.
            </p>
            <p className="mt-2 text-[13px] text-zinc-500">
              Start by syncing Gmail from the dashboard or wait for new
              job-related mail to appear here.
            </p>
          </div>
        )}
      </div>

      <GmailSuggestionReviewModal
        open={!!reviewingSuggestion}
        suggestion={reviewingSuggestion}
        submitting={saving}
        onClose={() => setReviewingSuggestion(null)}
        onConfirm={async (payload) => {
          if (!reviewingSuggestion) {
            return;
          }

          setSaving(true);
          try {
            await mutateSuggestion(reviewingSuggestion, {
              company: payload.company,
              position: payload.position,
              notes: payload.notes,
              hideEmail: payload.hideEmail,
            });
            setReviewingSuggestion(null);
          } catch (reviewError) {
            setError(
              reviewError instanceof Error
                ? reviewError.message
                : "Failed to save Gmail suggestion",
            );
          } finally {
            setSaving(false);
          }
        }}
      />
    </section>
  );
}
