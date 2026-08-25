import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { sellerSchema } from "@/lib/validations/seller";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSellerHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const seller = await prisma.seller.findUnique({
      where: { id, deletedAt: null },
      include: {
        purchases: {
          where: { deletedAt: null },
          include: { vehicle: true }
        }
      }
    });

    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    const totalValue = seller.purchases.reduce((acc, p) => acc + p.purchasePrice, 0);

    return NextResponse.json({ data: { ...seller, totalValue } });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateSellerHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const result = sellerSchema.partial().safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const existing = await prisma.seller.findUnique({ where: { id, deletedAt: null } });
    if (!existing) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    const updated = await prisma.seller.update({
      where: { id },
      data: result.data
    });

    await logAudit("Seller Updated", id, "Seller", userId, { updates: result.data });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteSellerHandler(req: Request, context: { params: Promise<{ id: string }> }, session: any) {
  try {
    const { id } = await context.params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const existing = await prisma.seller.findUnique({ 
      where: { id, deletedAt: null },
      include: { _count: { select: { purchases: { where: { deletedAt: null } } } } }
    });
    
    if (!existing) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    if (existing._count.purchases > 0) {
      return NextResponse.json({ error: "Cannot delete seller with active purchases" }, { status: 400 });
    }

    await prisma.seller.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await logAudit("Seller Soft Deleted", id, "Seller", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("sellers.read", getSellerHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PATCH = withAuth("sellers.update", updateSellerHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DELETE = withAuth("sellers.delete", deleteSellerHandler as any);
