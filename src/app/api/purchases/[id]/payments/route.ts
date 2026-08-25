import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { paymentSchema } from "@/lib/validations/payment";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPaymentsHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const payments = await prisma.purchasePayment.findMany({
      where: { purchaseId: id, deletedAt: null },
      orderBy: { paidAt: "desc" },
      include: { createdBy: { select: { name: true, email: true } } }
    });

    return NextResponse.json({ data: payments });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createPaymentHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = paymentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    // Check Purchase
    const purchase = await prisma.purchase.findUnique({ 
      where: { id, deletedAt: null },
      include: { payments: { where: { deletedAt: null } } }
    });
    if (!purchase) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });

    const totalPaid = purchase.payments.reduce((acc, pay) => acc + pay.amount, 0);
    const newAmount = result.data.amount;

    if (totalPaid + newAmount > purchase.purchasePrice) {
      return NextResponse.json({ 
        error: "Overpayment Error", 
        message: `Cannot pay more than the purchase price. Remaining is ${purchase.purchasePrice - totalPaid}` 
      }, { status: 400 });
    }

    const newPayment = await prisma.purchasePayment.create({
      data: {
        ...result.data,
        purchaseId: id,
        createdById: userId,
      }
    });

    await logAudit("Purchase Payment Created", newPayment.id, "PurchasePayment", userId, { 
      purchaseId: id, amount: newPayment.amount 
    });

    return NextResponse.json({ data: newPayment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("purchase_payments.read", getPaymentsHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAuth("purchase_payments.create", createPaymentHandler as any);
