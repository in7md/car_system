import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { updateExpenseSchema } from "@/lib/validations/expense";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getExpenseHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const expense = await prisma.expense.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        vehicle: true,
        createdBy: { select: { name: true, email: true } }
      }
    });

    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    return NextResponse.json({ data: expense });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateExpenseHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = updateExpenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = ((session.user as any).role || "").toUpperCase();
    
    if (result.data.status === "APPROVED" && userRole === "EMPLOYEE") {
      return NextResponse.json({ error: "لا تملك صلاحية اعتماد المصروفات." }, { status: 403 });
    }

    const existing = await prisma.expense.findUnique({ where: { id, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...result.data,
        date: result.data.date ? new Date(result.data.date) : undefined
      }
    });

    await logAudit("Expense Updated", id, "Expense", userId, { updates: result.data });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteExpenseHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = ((session?.user as any)?.role || "").toUpperCase();
    if (userRole !== "OWNER") {
      return NextResponse.json({ error: "غير مصرح لك بحذف المصروفات، هذه الصلاحية مخصصة للمالك فقط" }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    await prisma.expense.delete({
      where: { id }
    });

    await logAudit("Expense Deleted", id, "Expense", userId, { amount: existing.amount });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("expenses.read", getExpenseHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = withAuth("expenses.update", updateExpenseHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withAuth("expenses.delete", deleteExpenseHandler as any);
