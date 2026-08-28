import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { authenticator } from "otplib";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  // Credentials provider requires JWT session strategy
  session: { strategy: "jwt" as const },
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signin",
    error: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER ?? "",
      from: process.env.EMAIL_FROM ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA Code (if enabled)", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { roles: { include: { role: true } } }
        });
        
        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }
        
        const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
        
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        const isOwnerOrManager = user.roles.some(
          (ur) => ur.role.name.toUpperCase() === "OWNER" || ur.role.name.toUpperCase() === "MANAGER" || ur.role.name.toUpperCase() === "ACCOUNTANT"
        );

        if (isOwnerOrManager && user.twoFactorSecret) {
          if (!credentials.totp) {
            throw new Error("2FA_REQUIRED");
          }
          
          const isValid = authenticator.verify({
            token: credentials.totp,
            secret: user.twoFactorSecret
          });

          if (!isValid) {
            throw new Error("Invalid 2FA code");
          }
        }
        
        const nextAuthUser = {
          id: user.id,
          email: user.email,
          role: user.roles[0]?.role.name
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return nextAuthUser as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
      }
      return session;
    }
  }
};
