import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | JobMemo",
  description: "How JobMemo collects and processes Gmail data.",
};

const CONTACT_EMAIL = "privacy@jobmemo.example";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 px-4 py-12 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
            Privacy Policy
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            How JobMemo handles your data
          </h1>
          <p className="mt-4 text-[15px] leading-7 text-zinc-600">
            JobMemo is a job-search organizer. When you connect Gmail, we only
            process the minimum information needed to classify job-related
            emails and present them back to you.
          </p>
        </div>

        <div className="mt-8 space-y-8 text-[15px] leading-7 text-zinc-700">
          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              What data JobMemo collects
            </h2>
            <p className="mt-2">
              JobMemo collects account information you use to sign in with
              Google, plus the Gmail metadata required to classify job-related
              messages.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              Google login data
            </h2>
            <p className="mt-2">
              We may store your Google profile basics such as your name, email
              address, and profile image, along with app session data needed to
              keep you signed in.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              Gmail read-only access
            </h2>
            <p className="mt-2">
              JobMemo requests Gmail read-only access only. We do not request
              Gmail modify, Gmail send, or full mail.google.com access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              What Gmail data is processed
            </h2>
            <p className="mt-2">
              We process message subject, sender, snippet, date, category,
              company, role, and Gmail message ID so the app can identify job
              application updates, interviews, assessments, rejections, and
              offers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              What data is not stored
            </h2>
            <p className="mt-2">
              JobMemo does not intentionally store full email bodies or Gmail
              content beyond the minimal metadata needed for the dashboard. We
              also do not intentionally display or store OTP, verification,
              security, payment, invoice, or banking emails.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              How to disconnect Gmail
            </h2>
            <p className="mt-2">
              You can disconnect Gmail inside JobMemo from the Gmail dashboard
              at any time. You can also revoke JobMemo access from your Google
              Account settings.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              Data deletion requests
            </h2>
            <p className="mt-2">
              If you want JobMemo to remove your data, contact us and we will
              help with deletion requests for stored account data and related
              Gmail metadata where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-950">Contact</h2>
            <p className="mt-2">
              Email:{" "}
              <a
                className="text-zinc-950 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-500"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-4 border-t border-zinc-200 pt-6 text-[13px] text-zinc-500">
          <Link className="hover:text-zinc-900" href="/login">
            Back to login
          </Link>
          <Link className="hover:text-zinc-900" href="/terms">
            Terms of Service
          </Link>
          <Link className="hover:text-zinc-900" href="/gmail">
            Gmail dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
