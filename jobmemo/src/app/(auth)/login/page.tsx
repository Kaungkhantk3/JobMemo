import Image from "next/image";
import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="w-full max-w-[440px] rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-10">
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

        <form
          className="mt-8 w-full"
          action={async () => {
            "use server";
            await signIn("google", {
              redirectTo: "/",
            });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-[15px] font-medium text-slate-950 shadow-[0_10px_30px_rgba(255,255,255,0.12)] transition-transform hover:-translate-y-0.5 hover:bg-slate-100"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path
                d="M21.35 11.1h-9.18v2.95h5.28c-.23 1.4-1.56 4.1-5.28 4.1-3.18 0-5.78-2.63-5.78-5.88s2.6-5.88 5.78-5.88c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.58 3.91 14.7 3 12.17 3 7.42 3 3.5 6.92 3.5 11.67s3.92 8.67 8.67 8.67c4.97 0 8.26-3.49 8.26-8.41 0-.56-.06-.99-.08-1.3Z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-xs leading-5 text-slate-400">
          Protected by Google OAuth and database sessions.
        </p>
      </div>
    </div>
  );
}
