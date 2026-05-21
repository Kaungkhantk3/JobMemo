import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        },
      },
    }),
  ],

  session: {
    strategy: "database",
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        console.log("ACCOUNT_SCOPE:", account.scope);
        console.log("HAS_ACCESS_TOKEN:", !!account.access_token);
        console.log("HAS_REFRESH_TOKEN:", !!account.refresh_token);

        const mutableToken = token as typeof token & {
          accessToken?: string | null;
          refreshToken?: string | null;
          scope?: string | null;
          provider?: string;
        };

        mutableToken.accessToken = account.access_token ?? null;
        mutableToken.refreshToken = account.refresh_token ?? null;
        mutableToken.scope = account.scope ?? null;
        mutableToken.provider = account.provider;
      }

      return token;
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});

// Re-export route handlers for app route compatibility
export const GET = handlers.GET;
export const POST = handlers.POST;
