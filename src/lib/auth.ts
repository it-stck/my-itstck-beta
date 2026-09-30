import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import type { UserRole } from "@/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Use Prisma to persist sessions, accounts, etc.
  adapter: PrismaAdapter(db),

  // OAuth providers
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      // Request extra scope to read user email
      authorization: { params: { scope: "read:user user:email" } },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID ?? "common",
    }),
  ],

  // Session strategy (database-backed for revocation support)
  session: { strategy: "database" },

  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/onboarding",
  },

  callbacks: {
    // Inject user data into the session
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = (user as { username?: string }).username ?? null;
        session.user.role = (user as { role?: UserRole }).role ?? "USER";
        session.user.onboardingCompleted =
          (user as { onboardingCompleted?: boolean }).onboardingCompleted ?? false;
      }
      return session;
    },

    // Control sign-in (can block specific emails / domains)
    async signIn({ user }) {
      // Block if email is missing (shouldn't happen with these providers)
      if (!user.email) return false;

      // Optional: allowlist of domains
      // if (!user.email.endsWith("@yourcompany.com")) return false;

      return true;
    },

    // Redirect after sign-in
    async redirect({ url, baseUrl }) {
      // Relative URL - safe
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Same origin - safe
      if (new URL(url).origin === baseUrl) return url;
      // Default
      return baseUrl;
    },
  },

  events: {
    // Called when a new user signs up for the first time
    async createUser({ user }) {
      // Create an empty profile for the new user
      await db.profile.create({
        data: {
          userId: user.id,
          isPublic: false,
        },
      });
    },
  },

  // Logging
  debug: process.env.NODE_ENV === "development",
});

// ─── Type augmentation for next-auth ─────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username: string | null;
      role: UserRole;
      onboardingCompleted: boolean;
    };
  }

  interface User {
    username?: string | null;
    role?: UserRole;
    onboardingCompleted?: boolean;
  }
}
