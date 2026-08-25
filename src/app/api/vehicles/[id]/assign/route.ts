import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { logAudit } from "@/services/audit";
import { z } from "zod";

const assignSchema = z.object({
  employeeId: z.string().min(1),
  notes: z.string().optional()
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assignVehicleHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = assignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const existing = await prisma.vehicle.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const employee = await prisma.user.findUnique({ where: { id: result.data.employeeId } });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const assignment = await prisma.vehicleAssignment.create({
      data: {
        vehicleId: id,
        employeeId: result.data.employeeId,
        assignedById: userId,
        notes: result.data.notes
      }
    });

    await logAudit("Vehicle Assigned", id, "Vehicle", userId, { employeeId: employee.id });

    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAuth("vehicles.assign", assignVehicleHandler as any);
