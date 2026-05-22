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
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          include_granted_scopes: "true",
        },
      },
    }),
  ],

  session: {
    strategy: "database",
  },

  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        console.log("JWT_ACCOUNT_SCOPE:", account.scope);
        console.log("JWT_HAS_ACCESS:", !!account.access_token);
        console.log("JWT_HAS_REFRESH:", !!account.refresh_token);

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

  events: {
    async linkAccount(message) {
      console.log("LINK_ACCOUNT", {
        provider: message.account?.provider,
        scope: message.account?.scope,
        hasAccessToken: !!message.account?.access_token,
        hasRefreshToken: !!message.account?.refresh_token,
      });
    },
  },

  secret: process.env.AUTH_SECRET,
});

// Re-export route handlers for app route compatibility
export const GET = handlers.GET;
export const POST = handlers.POST;
