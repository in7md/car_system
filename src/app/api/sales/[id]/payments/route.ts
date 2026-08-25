import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { salePaymentSchema } from "@/lib/validations/sales";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createPaymentHandler(req: NextRequest, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = salePaymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    const sale = await prisma.sale.findUnique({
      where: { id, deletedAt: null },
      include: { payments: { where: { deletedAt: null } } }
    });

    if (!sale) return NextResponse.json({ error: "Sale not found" }, { status: 404 });

    const totalPaid = sale.payments.reduce((acc, curr) => acc + curr.amount, 0);
    const { amount, paidAt, method, receiptNumber, notes } = result.data;

    // Prevent overpayment
    if (totalPaid + amount > sale.salePrice) {
      return NextResponse.json({ error: "Payment amount exceeds remaining balance." }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const payment = await prisma.salePayment.create({
      data: {
        saleId: id,
        amount,
        paidAt: new Date(paidAt),
        method,
        receiptNumber,
        notes,
        createdById: userId
      }
    });

    await logAudit("Sale Payment Created", payment.id, "SalePayment", userId, { saleId: id, amount });

    return NextResponse.json({ data: payment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAuth("sales.create", createPaymentHandler as any);
