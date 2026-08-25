import { prisma } from "@/lib/prisma";

export async function logAudit(
  action: string,
  entityId: string | undefined,
  entityType: string,
  userId: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityId,
        entityType,
        userId,
        details: details ? details : undefined,
      }
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
