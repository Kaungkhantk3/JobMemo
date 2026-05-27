"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, RefreshCcw, Eye } from "lucide-react";

import type { GmailMessage } from "@/types/gmail";
import type { Application } from "@/types/application";

type GmailSyncResponse = {
  inboxEmails?: GmailMessage[];
  sentEmails?: GmailMessage[];
  syncedAtLabel?: string;
  inboxError?: string;
  sentError?: string;
  error?: string;
};

import { GmailReviewModal } from "./gmail-review-modal";

export default function GmailSuggestionsClient({
  onApplicationTracked,
}: {
  onApplicationTracked?: (application: Application) => void;
}) {
  const [syncData, setSyncData] = useState<{
    inboxEmails?: GmailMessage[];
    sentEmails?: GmailMessage[];
    syncedAtLabel?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewingEmail, setReviewingEmail] = useState<GmailMessage | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const suggestions = useMemo(() => {
    const inbox = syncData?.inboxEmails ?? [];
    return inbox.filter((e) => !e.applicationId && !e.hidden);
  }, [syncData]);

  const lastSynced = syncData?.syncedAtLabel ?? "Never synced";

  const runSync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/gmail/sync", { cache: "no-store" });
      const payload = (await res.json().catch(() => ({}))) as GmailSyncResponse;
      if (!res.ok) throw new Error(payload.error || "Failed to sync");
      setSyncData(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [syncing]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void runSync();
    }, 0);
    return () => window.clearTimeout(id);
  }, [runSync]);

  async function addApplicationFromEmail(email: GmailMessage) {
    setSaving(true);
    try {
      const body = {
        company: email.company ?? "",
        position: email.role ?? "",
        status:
          email.userCorrectedStatus ?? email.applicationState ?? "APPLIED",
        notes: email.notes ?? undefined,
        appliedAt: email.date,
      };

      const res = await fetch(`/api/gmail/email/${email.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          reviewed: true,
        }),
      });

      const result = (await res.json().catch(() => null)) as {
        review?: unknown;
        application?: Application | null;
        error?: string;
      } | null;

      if (!res.ok) {
        throw new Error(result?.error || "Failed to add application");
      }

      if (result?.application) {
        onApplicationTracked?.(result.application);
      }

      // remove from client suggestions
      setSyncData((current) => {
        if (!current) return current;
        return {
          ...current,
          inboxEmails: (current.inboxEmails ?? []).filter(
            (e) => e.id !== email.id,
          ),
        };
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function dismissEmail(email: GmailMessage) {
    setSaving(true);
    try {
      const res = await fetch(`/api/gmail/email/${email.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hidden: true,
          status: "IGNORE",
          reviewed: true,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload?.error || "Failed to dismiss email");
      }

      setSyncData((current) => {
        if (!current) return current;
        return {
          ...current,
          inboxEmails: (current.inboxEmails ?? []).filter(
            (e) => e.id !== email.id,
          ),
        };
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-label-xs mb-2">Suggested from Gmail</p>
          <h2 className="text-heading-sm text-zinc-950">
            Suggested from Gmail
          </h2>
          <p className="mt-1 text-body text-zinc-600">
            Gmail suggestions you can import into Applications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[12px] text-zinc-500">
            Last synced {lastSynced}
          </div>
          <button
            type="button"
            onClick={() => void runSync()}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] font-medium text-zinc-700 shadow-sm transition-smooth hover:bg-zinc-50"
          >
            <RefreshCcw
              className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
            />
            Sync Gmail
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <p className="font-medium">Unable to load suggestions.</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 px-6 py-8 text-center">
            <div className="mb-3 inline-flex items-center justify-center rounded-full bg-white p-3 text-zinc-500 shadow-sm">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-[14px] font-medium text-zinc-900">
              No new Gmail suggestions
            </p>
            <p className="mt-2 text-[13px] text-zinc-500">
              We will surface relevant emails here when available.
            </p>
          </div>
        ) : (
          suggestions.map((email) => (
            <article
              key={email.id}
              className="card-base px-4 py-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900 truncate">
                  {email.company ?? "Unknown company"}
                </p>
                <p className="text-zinc-700 text-body-sm mt-1 truncate">
                  {email.role ?? "Role not detected"}
                </p>
                <p className="mt-2 text-zinc-700 text-body-sm line-clamp-2">
                  {email.subject ?? "(No subject)"}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-[12px] text-zinc-500">
                  {new Date(email.date).toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReviewingEmail(email)}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-700 shadow-sm transition-smooth hover:bg-zinc-50"
                  >
                    <Eye className="h-4 w-4" />
                    Review
                  </button>
                  <button
                    onClick={() => void addApplicationFromEmail(email)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-700 shadow-sm transition-smooth hover:bg-zinc-50"
                  >
                    Add to Applications
                  </button>
                  <button
                    onClick={() => void dismissEmail(email)}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[12px] text-rose-700 shadow-sm transition-smooth hover:bg-rose-100"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <GmailReviewModal
        open={!!reviewingEmail}
        email={reviewingEmail}
        submitting={saving}
        onClose={() => setReviewingEmail(null)}
        onConfirm={async (payload) => {
          if (!reviewingEmail) return;
          setSaving(true);
          try {
            const res = await fetch(`/api/gmail/email/${reviewingEmail.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const result = (await res.json().catch(() => null)) as {
              review?: unknown;
              application?: Application | null;
              error?: string;
            } | null;
            if (!res.ok)
              throw new Error(result?.error || "Failed to save review");
            if (result?.application) onApplicationTracked?.(result.application);
            setSyncData((current) => {
              if (!current) return current;
              return {
                ...current,
                inboxEmails: (current.inboxEmails ?? []).filter(
                  (e) => e.id !== reviewingEmail.id,
                ),
              };
            });
          } catch (err) {
            console.error(err);
          } finally {
            setSaving(false);
            setReviewingEmail(null);
          }
        }}
      />
    </section>
  );
}
