import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { updateSaleSchema } from "@/lib/validations/sales";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getSaleHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const sale = await prisma.sale.findUnique({
      where: { id, deletedAt: null },
      include: {
        customer: true,
        vehicle: true,
        payments: { where: { deletedAt: null }, orderBy: { paidAt: 'desc' } },
        createdBy: { select: { name: true, email: true } }
      }
    });

    if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    return NextResponse.json({ data: sale });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateSaleHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = updateSaleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    const existing = await prisma.sale.findUnique({ where: { id, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: "Sale not found" }, { status: 404 });

    const updated = await prisma.sale.update({
      where: { id },
      data: {
        ...result.data,
        saleDate: result.data.saleDate ? new Date(result.data.saleDate) : undefined
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;
    await logAudit("Sale Updated", id, "Sale", userId, { updates: result.data });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteSaleHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const existing = await prisma.sale.findUnique({
      where: { id, deletedAt: null },
      include: { vehicle: true }
    });

    if (!existing) return NextResponse.json({ error: "Sale not found" }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    await prisma.$transaction(async (tx) => {
      // 1. Soft delete sale
      await tx.sale.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      // 2. Revert vehicle status to READY_FOR_SALE
      await tx.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: "READY_FOR_SALE" }
      });

      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: existing.vehicleId,
          previousStatus: existing.vehicle.status,
          newStatus: "READY_FOR_SALE",
          changedById: userId,
          notes: "Auto-reverted due to Sale Soft Deletion"
        }
      });
    });

    await logAudit("Sale Soft Deleted", id, "Sale", userId, { salePrice: existing.salePrice });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("sales.read", getSaleHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = withAuth("sales.update", updateSaleHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withAuth("sales.delete", deleteSaleHandler as any);
