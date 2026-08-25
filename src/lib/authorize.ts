// src/lib/authorize.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUserPermissions } from "@/services/permissions";

/**
 * Helper to wrap API handlers with authentication and authorization checks.
 */
export function withAuth(
  requiredPermission?: string | string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler?: (req: Request, context: any, session: any) => Promise<Response>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async function (req: Request, context: any) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    if (requiredPermission) {
      const perms = await getUserPermissions(userId);
      const requirements = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
      
      const hasPermission = requirements.every(reqPerm => perms.includes(reqPerm));
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userRole = ((session.user as any)?.role || "").toUpperCase();
      
      // Allow if has permission OR is OWNER/MANAGER/ACCOUNTANT
      const isPrivilegedRole = userRole === "OWNER" || userRole === "MANAGER" || userRole === "ACCOUNTANT";
      
      if (!hasPermission && !isPrivilegedRole) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    if (handler) {
      return handler(req, context, session);
    }

    return NextResponse.json({ success: true });
  };
}
