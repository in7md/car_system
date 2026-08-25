// src/services/permissions.ts
import { prisma } from "@/lib/prisma";

/**
 * Fetches all permissions for a given user based on their assigned roles.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const permissions = new Set<string>();

  for (const userRole of userRoles) {
    for (const rolePerm of userRole.role.permissions) {
      permissions.add(rolePerm.permission.name);
    }
  }

  return Array.from(permissions);
}
