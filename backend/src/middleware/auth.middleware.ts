import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth/index.js";
import { fromNodeHeaders } from "better-auth/node";

/**
 * Extracts session from request. Attaches `req.user` and `req.session` if valid.
 */
export async function getSession(req: Request) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return session;
}

/**
 * Middleware: requires authenticated user. Returns 401 if not authenticated.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await getSession(req);
    if (!session) {
      res.status(401).json({ success: false, message: "Unauthorized. Please login." });
      return;
    }
    // Attach to request for downstream handlers
    (req as any).user = session.user;
    (req as any).session = session.session;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid session." });
  }
}

import { db } from "../db/index.js";
import { permissions, role_permissions } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

/**
 * Middleware: Requires a specific permission to proceed.
 * Checks the custom RBAC tables in the database.
 */
export function authorize(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await getSession(req);
      if (!session) {
        res.status(401).json({ success: false, message: "Unauthorized. Please login." });
        return;
      }

      const roleId = (session.user as any).roleId;
      if (!roleId) {
        res.status(403).json({ success: false, message: "Forbidden. Role not assigned." });
        return;
      }

      // Check if role has the requested permission
      const authQuery = await db
        .select({ permissionId: role_permissions.permissionId })
        .from(role_permissions)
        .innerJoin(permissions, eq(role_permissions.permissionId, permissions.id))
        .where(
          and(
            eq(role_permissions.roleId, roleId),
            eq(permissions.name, requiredPermission)
          )
        )
        .limit(1);

      if (authQuery.length === 0) {
        // Optional audit log for denied access could go here
        console.warn(`[RBAC] User ${session.user.id} denied access to ${requiredPermission}`);
        res.status(403).json({ success: false, message: "Forbidden. Insufficient permissions." });
        return;
      }

      (req as any).user = session.user;
      (req as any).session = session.session;
      next();
    } catch (error) {
      console.error("[RBAC Error]", error);
      res.status(500).json({ success: false, message: "Internal server error during authorization." });
    }
  };
}
