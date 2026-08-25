import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { createSaleSchema } from "@/lib/validations/sales";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getSalesHandler(req: NextRequest, context: any, session: any) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { deletedAt: null };
    if (vehicleId) where.vehicleId = vehicleId;

    const sales = await prisma.sale.findMany({
      where,
      orderBy: { saleDate: "desc" },
      include: {
        customer: true,
        vehicle: true,
        payments: { where: { deletedAt: null } }
      }
    });

    return NextResponse.json({ data: sales });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function createSaleHandler(req: NextRequest, context: any, session: any) {
  try {
    const body = await req.json();
    const result = createSaleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    const { vehicleId, customerId, salePrice, saleDate, paymentMethod, notes } = result.data;

    // Check if vehicle already has an active sale
    const existingSale = await prisma.sale.findFirst({
      where: { vehicleId, deletedAt: null }
    });

    if (existingSale) {
      return NextResponse.json({ error: "Vehicle already has an active sale" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    // Transaction to create sale and update vehicle status
    const transactionResult = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          vehicleId,
          customerId,
          salePrice,
          saleDate: new Date(saleDate),
          paymentMethod,
          notes,
          createdById: userId
        }
      });

      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: "SOLD" }
      });

      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId,
          previousStatus: vehicle?.status,
          newStatus: "SOLD",
          changedById: userId,
          notes: "Auto-updated via Sale Creation"
        }
      });

      return sale;
    });

    await logAudit("Sale Created", transactionResult.id, "Sale", userId, { vehicleId, salePrice });

    return NextResponse.json({ data: transactionResult }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("sales.read", getSalesHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAuth("sales.create", createSaleHandler as any);
