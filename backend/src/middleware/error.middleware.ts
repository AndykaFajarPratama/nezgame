import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";

/**
 * Global error handling middleware.
 * Catches all errors and returns a structured JSON response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`❌ Unhandled error: ${err.message}`, env.isProduction ? "" : err.stack);

  res.status(500).json({
    success: false,
    message: env.isProduction
      ? "Terjadi kesalahan server. Silakan coba lagi."
      : err.message,
  });
}

/**
 * Security headers middleware.
 */
export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}
