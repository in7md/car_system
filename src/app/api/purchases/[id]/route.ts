import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { purchaseSchema } from "@/lib/validations/purchase";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPurchaseHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const purchase = await prisma.purchase.findUnique({
      where: { id, deletedAt: null },
      include: {
        vehicle: true,
        seller: true,
        payments: {
          where: { deletedAt: null },
          orderBy: { paidAt: "desc" },
          include: { createdBy: { select: { name: true, email: true } } }
        },
        createdBy: { select: { name: true, email: true } }
      }
    });

    if (!purchase) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });

    const totalPaid = purchase.payments.reduce((acc, pay) => acc + pay.amount, 0);
    let paymentStatus = "UNPAID";
    if (totalPaid >= purchase.purchasePrice) paymentStatus = "PAID";
    else if (totalPaid > 0) paymentStatus = "PARTIALLY_PAID";

    return NextResponse.json({
      data: {
        ...purchase,
        totalPaid,
        remaining: Math.max(0, purchase.purchasePrice - totalPaid),
        paymentStatus
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updatePurchaseHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = purchaseSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const existing = await prisma.purchase.findUnique({ where: { id, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });

    // Important: Modifying purchasePrice is a sensitive action
    if (result.data.purchasePrice !== undefined && result.data.purchasePrice !== existing.purchasePrice) {
      // Add a manual check for explicit permission if desired, but here we assume 'purchases.update' allows it.
      await logAudit("Purchase Price Changed", id, "Purchase", userId, { 
        oldValue: existing.purchasePrice, 
        newValue: result.data.purchasePrice 
      });
    }

    const updated = await prisma.purchase.update({
      where: { id },
      data: result.data
    });

    await logAudit("Purchase Updated", id, "Purchase", userId, { updates: result.data });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deletePurchaseHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const existing = await prisma.purchase.findUnique({ where: { id, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });

    await prisma.purchase.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAudit("Purchase Soft Deleted", id, "Purchase", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("purchases.read", getPurchaseHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = withAuth("purchases.update", updatePurchaseHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withAuth("purchases.delete", deletePurchaseHandler as any);
