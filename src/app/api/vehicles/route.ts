import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { createVehicleSchema } from "@/lib/validations/vehicle";
import { logAudit } from "@/services/audit";
import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getVehiclesHandler(req: Request, context: any, session: any) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    
    // Build query
    const where: Prisma.VehicleWhereInput = {
      deletedAt: null,
      OR: search ? [
        { vehicleCode: { contains: search, mode: "insensitive" } },
        { plateNumber: { contains: search, mode: "insensitive" } },
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ] : undefined
    };

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: vehicles });
  } catch (error) {
    console.error("GET vehicles error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createVehicleHandler(req: Request, context: any, session: any) {
  try {
    const body = await req.json();
    const result = createVehicleSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    const data = result.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    // Generate unique CAR-YYYY-XXXX
    const year = new Date().getFullYear();
    const prefix = `CAR-${year}-`;
    
    // We can use a transaction or just find the max count.
    // For simplicity, we'll find the last created vehicle in this year
    const lastVehicle = await prisma.vehicle.findFirst({
      where: { vehicleCode: { startsWith: prefix } },
      orderBy: { vehicleCode: "desc" }
    });

    let nextNumber = 1;
    if (lastVehicle && lastVehicle.vehicleCode) {
      const parts = lastVehicle.vehicleCode.split("-");
      if (parts.length === 3) {
        nextNumber = parseInt(parts[2], 10) + 1;
      }
    }

    const vehicleCode = `${prefix}${nextNumber.toString().padStart(4, "0")}`;

    const newVehicle = await prisma.vehicle.create({
      data: {
        ...data,
        vehicleCode,
        createdById: userId,
      }
    });

    await logAudit("Vehicle Created", newVehicle.id, "Vehicle", userId, { vehicleCode });

    return NextResponse.json({ data: newVehicle }, { status: 201 });
  } catch (error) {
    console.error("POST vehicle error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("vehicles.read", getVehiclesHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAuth("vehicles.create", createVehicleHandler as any);
