import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { createVehicleSchema } from "@/lib/validations/vehicle";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getVehicleHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id, deletedAt: null },
      include: {
        statusHistory: {
          orderBy: { changedAt: "desc" },
          include: { changedBy: { select: { name: true, email: true } } },
        },
        assignments: {
          orderBy: { assignedAt: "desc" },
          include: {
            employee: { select: { name: true, email: true } },
            assignedBy: { select: { name: true, email: true } },
          },
        },
        createdBy: { select: { name: true, email: true } },
        purchases: {
          where: { deletedAt: null },
          include: {
            seller: true,
            payments: { where: { deletedAt: null } }
          }
        },
        expenses: {
          where: { deletedAt: null },
          orderBy: { date: 'desc' },
          include: {
            category: true,
            createdBy: { select: { name: true, email: true } }
          }
        },
        sales: {
          where: { deletedAt: null },
          include: {
            customer: true,
            payments: { where: { deletedAt: null } }
          }
        }
      }
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ data: vehicle });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateVehicleHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = createVehicleSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const existing = await prisma.vehicle.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: result.data
    });

    await logAudit("Vehicle Updated", id, "Vehicle", userId, { updates: result.data });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteVehicleHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const existing = await prisma.vehicle.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    await prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAudit("Vehicle Soft Deleted", id, "Vehicle", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth(undefined, async (req: Request, context: any, session: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = ((session?.user as any)?.role || "").toUpperCase();
  if (!["OWNER", "MANAGER", "ACCOUNTANT", "EMPLOYEE"].includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return getVehicleHandler(req, context, session);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = withAuth(undefined, async (req: Request, context: any, session: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = ((session?.user as any)?.role || "").toUpperCase();
  if (!["OWNER", "MANAGER", "ACCOUNTANT", "EMPLOYEE"].includes(userRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return updateVehicleHandler(req, context, session);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withAuth("vehicles.delete", deleteVehicleHandler as any);
