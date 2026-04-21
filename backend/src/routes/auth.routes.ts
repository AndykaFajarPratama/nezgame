import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth/index.js";

const router = Router();

/**
 * Mount Better Auth on /api/auth/*
 * This handles: sign-up, sign-in, sign-out, get-session, etc.
 */
router.all(/^\/api\/auth\/.*/, toNodeHandler(auth));

export default router;
