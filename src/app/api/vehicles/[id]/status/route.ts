import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { logAudit } from "@/services/audit";
import { z } from "zod";
import { VehicleStatus } from "@prisma/client";

const statusSchema = z.object({
  status: z.nativeEnum(VehicleStatus),
  notes: z.string().optional()
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateStatusHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = statusSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const existing = await prisma.vehicle.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    if (existing.status === result.data.status) {
      return NextResponse.json({ error: "Vehicle is already in this status" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.vehicle.update({
        where: { id },
        data: { status: result.data.status }
      });

      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: id,
          previousStatus: existing.status,
          newStatus: result.data.status,
          changedById: userId,
          notes: result.data.notes
        }
      });
    });

    await logAudit("Vehicle Status Changed", id, "Vehicle", userId, { from: existing.status, to: result.data.status });

    return NextResponse.json({ success: true, newStatus: result.data.status });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = withAuth(undefined, async (req: Request, context: any, session: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = ((session?.user as any)?.role || "").toUpperCase();
  if (!["OWNER", "MANAGER", "ACCOUNTANT", "EMPLOYEE"].includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return updateStatusHandler(req, context, session);
});
