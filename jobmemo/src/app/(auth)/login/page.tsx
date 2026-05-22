import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="w-full max-w-110 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg">
          <Image
            src="/logo.png"
            alt="JobMemo"
            width={168}
            height={48}
            priority
            className="h-auto w-auto object-contain"
          />
        </div>

        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-cyan-200/80">
          Private workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Track every application in one place.
        </h1>
        <p className="mt-3 max-w-[34ch] text-sm leading-6 text-slate-300 sm:text-[15px]">
          Sign in with Google to access your private dashboard, manage your
          pipeline, and keep your job search organized.
        </p>

        <div className="mt-8 w-full">
          <GoogleSignInButton />
        </div>

        <p className="mt-6 text-xs leading-5 text-slate-400">
          Protected by Google OAuth and database sessions.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
          <Link className="transition-colors hover:text-white" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="transition-colors hover:text-white" href="/terms">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
