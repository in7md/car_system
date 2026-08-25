import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { updateCustomerSchema } from "@/lib/validations/sales";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getCustomerHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const customer = await prisma.customer.findUnique({
      where: { id, deletedAt: null },
      include: {
        sales: {
          where: { deletedAt: null },
          include: { vehicle: true, payments: true }
        },
        createdBy: { select: { name: true, email: true } }
      }
    });

    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    return NextResponse.json({ data: customer });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateCustomerHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = updateCustomerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { id, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    const updated = await prisma.customer.update({
      where: { id },
      data: result.data
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;
    await logAudit("Customer Updated", id, "Customer", userId, { updates: result.data });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteCustomerHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const existing = await prisma.customer.findUnique({
      where: { id, deletedAt: null },
      include: { _count: { select: { sales: { where: { deletedAt: null } } } } }
    });

    if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    if (existing._count.sales > 0) {
      return NextResponse.json({ error: "Cannot delete customer with active sales" }, { status: 400 });
    }

    await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;
    await logAudit("Customer Soft Deleted", id, "Customer", userId, { name: existing.name });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("customers.read", getCustomerHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = withAuth("customers.update", updateCustomerHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withAuth("customers.delete", deleteCustomerHandler as any);
