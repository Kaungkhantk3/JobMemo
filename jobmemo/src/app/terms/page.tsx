import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | JobMemo",
  description: "Basic terms for using JobMemo.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 px-4 py-12 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
            Terms of Service
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Basic terms for JobMemo
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-zinc-600">
            JobMemo is an early-stage SaaS MVP. These terms are intentionally
            simple and are meant to set expectations for how the app works
            today.
          </p>
        </div>

        <div className="mt-8 space-y-8 text-[15px] leading-7 text-zinc-700">
          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              Provided as-is
            </h2>
            <p className="mt-2">
              JobMemo is provided as-is and as available. We may update, pause,
              or change features at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              Your responsibility
            </h2>
            <p className="mt-2">
              You are responsible for the data you connect to JobMemo and for
              reviewing any actions you take based on the app’s output.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              Optional Gmail sync
            </h2>
            <p className="mt-2">
              Gmail sync is optional. You can use JobMemo without connecting
              Gmail, and you can disconnect access at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              Classification accuracy
            </h2>
            <p className="mt-2">
              JobMemo uses automated classification to organize job-related
              emails. We do not guarantee that classification will always be
              correct or complete.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              Account access
            </h2>
            <p className="mt-2">
              If you revoke Gmail access or disconnect your account, some app
              features may stop working until you reconnect.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-zinc-200 pt-6 text-[13px] text-zinc-500">
          <Link className="hover:text-zinc-900" href="/login">
            Back to login
          </Link>
          <Link className="hover:text-zinc-900" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-zinc-900" href="/gmail">
            Gmail dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
