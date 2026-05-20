"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        void signIn("google", { callbackUrl: "/" });
      }}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-[15px] font-medium text-slate-950 shadow-[0_10px_30px_rgba(255,255,255,0.12)] transition-transform hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? (
        <>
          <svg
            aria-hidden="true"
            className="h-5 w-5 animate-spin text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="45"
              strokeDashoffset="15"
            />
          </svg>
          Signing in...
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path
              d="M21.35 11.1h-9.18v2.95h5.28c-.23 1.4-1.56 4.1-5.28 4.1-3.18 0-5.78-2.63-5.78-5.88s2.6-5.88 5.78-5.88c1.81 0 3.02.77 3.71 1.43l2.53-2.44C16.58 3.91 14.7 3 12.17 3 7.42 3 3.5 6.92 3.5 11.67s3.92 8.67 8.67 8.67c4.97 0 8.26-3.49 8.26-8.41 0-.56-.06-.99-.08-1.3Z"
              fill="currentColor"
            />
          </svg>
          Continue with Google
        </>
      )}
    </button>
  );
}
