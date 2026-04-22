import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";
import { env } from "../config/env.js";
import { emailService } from "../services/email.service.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Always log this to debug
        console.log(`[Better Auth] Sending OTP ${otp} to ${email} (type: ${type})`);
        await emailService.sendVerificationEmail(email, "Pendaftar", otp);
      },
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
    }),
  ],
  email: {
    from: "NezGame <noreply@nezgame.com>",
    sendPasswordResetEmail: async ({ user, url }: { user: any; url: string }) => {
      await emailService.sendPasswordResetEmail(user.email, user.name, url);
    },
  },
  user: {
    additionalFields: {
      roleId: {
        type: "number",
        required: false,
        input: false, // users can't set their own role
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24, // Strict 24 hours (1 day) limit for ALL roles
    updateAge: 60 * 60 * 24, // Prevents auto-extension during the 24 hours
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              roleId: 3, // Default to Customer
            },
          };
        },
      },
    },
  },
  trustedOrigins: env.isProduction 
    ? [env.APP_DOMAIN, env.FRONTEND_URL] 
    : ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
});

export type Auth = typeof auth;
