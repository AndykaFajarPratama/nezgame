import "dotenv/config";

export const env = {
  // App
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  APP_DOMAIN: process.env.APP_DOMAIN || "http://localhost:3000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173", // ✅ DITAMBAH

  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",

  // Better Auth
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // Apigame
  APIGAME_MERCHANT_ID: process.env.APIGAME_MERCHANT_ID || "",
  APIGAME_SECRET_KEY: process.env.APIGAME_SECRET_KEY || "",

  // Midtrans
  MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY || "",
  MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || "",
  MIDTRANS_IS_PRODUCTION: process.env.MIDTRANS_IS_PRODUCTION === "true",

  // Pricing
  PRODUCT_MARKUP_FLAT: parseFloat(process.env.PRODUCT_MARKUP_FLAT || "2000"),

  // EmailJS
  EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID || "",
  EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || "",
  EMAILJS_PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY || "",
  EMAILJS_VERIFY_TEMPLATE_ID: process.env.EMAILJS_VERIFY_TEMPLATE_ID || "template_verification",
  EMAILJS_RESET_TEMPLATE_ID: process.env.EMAILJS_RESET_TEMPLATE_ID || "template_reset",

  get isProduction() {
    return this.NODE_ENV === "production";
  },
} as const;

// Validate required env vars
export function validateEnv() {
  const required = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "APIGAME_MERCHANT_ID",
    "APIGAME_SECRET_KEY",
    "MIDTRANS_CLIENT_KEY",
    "MIDTRANS_SERVER_KEY",
    "EMAILJS_SERVICE_ID",
    "EMAILJS_PUBLIC_KEY",
    "EMAILJS_PRIVATE_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ CRITICAL: Missing required environment variables: ${missing.join(", ")}`);
    console.error("Check your .env file or server configuration.");
    process.exit(1);
  }
}