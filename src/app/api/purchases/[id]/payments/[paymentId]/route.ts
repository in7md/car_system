import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deletePaymentHandler(req: Request, context: { params: Promise<{ id: string, paymentId: string }> }, session: any) {
  try {
    const { id, paymentId } = await context.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const existing = await prisma.purchasePayment.findUnique({ 
      where: { id: paymentId, purchaseId: id, deletedAt: null } 
    });
    
    if (!existing) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    await prisma.purchasePayment.update({
      where: { id: paymentId },
      data: { deletedAt: new Date() }
    });

    await logAudit("Purchase Payment Soft Deleted", paymentId, "PurchasePayment", userId, { purchaseId: id, amount: existing.amount });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withAuth("purchase_payments.delete", deletePaymentHandler as any);
