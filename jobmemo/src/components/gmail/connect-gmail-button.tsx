"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type ConnectGmailButtonProps = {
  label: string;
  callbackUrl?: string;
};

export function ConnectGmailButton({
  label,
  callbackUrl = "/gmail",
}: ConnectGmailButtonProps) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        void signIn(
          "google",
          {
            callbackUrl,
          },
          {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
            include_granted_scopes: "true",
            scope:
              "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          },
        );
      }}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f1117] px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#171a22] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Connecting..." : label}
    </button>
  );
}
