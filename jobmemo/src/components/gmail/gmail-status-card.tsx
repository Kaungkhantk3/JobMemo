"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  RefreshCcw,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

import { ConnectGmailButton } from "./connect-gmail-button";
import { DisconnectGmailButton } from "./disconnect-gmail-button";

type GmailUser = {
  name?: string | null;
  email?: string | null;
};

type GmailAccount = {
  scope?: string | null;
  provider?: string;
  providerAccountId?: string;
} | null;

type GmailReviewsResponse = {
  canSync?: boolean;
  reviewCount?: number;
  lastSyncAtLabel?: string;
  error?: string;
};

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

function hasGmailScope(scope?: string | null) {
  return !!scope?.includes("gmail.readonly") || !!scope?.includes(GMAIL_SCOPE);
}

export function GmailStatusCard({
  user,
  account,
  gmailVerified = false,
}: {
  user: GmailUser;
  account: GmailAccount;
  gmailVerified?: boolean;
}) {
  const gmailConnected = gmailVerified || hasGmailScope(account?.scope);
  const googleConnected = !!account;
  const needsReconnect = googleConnected && !gmailConnected;

  const [reviewsMeta, setReviewsMeta] = useState<GmailReviewsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviewsMeta = useCallback(async () => {
    setLoading(true);

    try {
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
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load Gmail cache.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const runSync = useCallback(async () => {
    if (syncing || !gmailConnected) {
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

      await loadReviewsMeta();
      setError(null);
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "Unable to sync Gmail messages.",
      );
    } finally {
      setSyncing(false);
    }
  }, [gmailConnected, loadReviewsMeta, syncing]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReviewsMeta();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadReviewsMeta]);

  const heading = gmailConnected
    ? "Gmail connected"
    : needsReconnect
      ? "Reconnect Gmail"
      : "Connect Gmail";

  if (loading && !reviewsMeta) {
    return (
      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-smooth">
        <div className="border-b border-zinc-200 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
          <div className="h-4 w-36 animate-pulse rounded bg-zinc-200" />
          <div className="mt-4 h-8 w-72 animate-pulse rounded bg-zinc-200" />
          <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-6">
          <div className="space-y-4">
            <div className="h-4 w-80 animate-pulse rounded bg-zinc-100" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4"
                >
                  <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
                  <div className="mt-2 h-4 w-16 animate-pulse rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
            <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
            <div className="mt-3 h-5 w-36 animate-pulse rounded bg-zinc-200" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-100" />
            <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-smooth">
      <div className="border-b border-zinc-200 bg-linear-to-r from-zinc-50 to-white px-5 py-5 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gmail integration
            </div>
            <h2 className="mt-4 text-heading-sm md:text-heading text-zinc-950">
              {heading}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 md:text-[15px]">
              Connect Gmail read-only access so JobMemo can detect job-related
              updates while keeping send and delete permissions disabled.
            </p>
          </div>

          <div className="hidden rounded-2xl bg-zinc-900 p-3 text-white md:block">
            <Mail className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Read-only access
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            <UserCircle2 className="h-3.5 w-3.5" />
            {user.name ?? "Signed in user"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            Last synced {reviewsMeta?.lastSyncAtLabel ?? "Never synced"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-[12px] text-zinc-600 shadow-sm">
            {reviewsMeta?.reviewCount ?? 0} review records
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[1.2fr_0.8fr] md:p-6">
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4 transition-shadow hover:shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-zinc-700 shadow-sm">
                <UserCircle2 className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                  Connected Google account
                </p>
                <p className="mt-1 truncate text-[15px] font-medium text-zinc-950">
                  {user.email ?? "No email available"}
                </p>
                <p className="truncate text-[13px] text-zinc-500">
                  {googleConnected
                    ? gmailConnected
                      ? "Gmail permissions granted"
                      : "Google signed in, Gmail scope missing"
                    : "No Google connection yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Privacy and security
            </p>
            <p className="mt-2 text-[13px] leading-6 text-zinc-600">
              JobMemo only reads Gmail metadata and snippets needed to detect
              job-related emails. It cannot send, delete, or modify messages.
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-900 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4.5 w-4.5" />
                <div>
                  <p className="font-medium">Unable to refresh Gmail data.</p>
                  <p className="mt-1 text-[13px] leading-6 text-amber-800/90">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Connection status
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-950">
              {gmailConnected
                ? "Gmail connected"
                : needsReconnect
                  ? "Reconnect Gmail"
                  : "Connect Gmail"}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-zinc-500">
              {gmailConnected
                ? "Gmail read access is ready for manual syncs and future imports."
                : needsReconnect
                  ? "Reconnect to request Gmail read scope and refresh token access."
                  : "Start the Google consent flow to add Gmail read access."}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              onClick={() => void runSync()}
              disabled={syncing || !gmailConnected}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-[13px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw
                className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Gmail"}
            </button>

            {gmailConnected ? (
              <div className="space-y-3">
                <button
                  type="button"
                  disabled
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] font-medium text-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Gmail Connected
                </button>
                <DisconnectGmailButton />
              </div>
            ) : needsReconnect ? (
              <div className="space-y-3">
                <ConnectGmailButton label="Reconnect Gmail" />
                <DisconnectGmailButton />
              </div>
            ) : (
              <ConnectGmailButton label="Connect Gmail" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
