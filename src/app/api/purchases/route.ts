import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { purchaseSchema } from "@/lib/validations/purchase";
import { logAudit } from "@/services/audit";
import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPurchasesHandler(req: Request, context: any, session: any) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const sellerId = searchParams.get("sellerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseWhereInput = {
      deletedAt: null,
      vehicleId: vehicleId ? vehicleId : undefined,
      sellerId: sellerId ? sellerId : undefined,
    };

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { purchaseDate: "desc" },
        include: { 
          vehicle: { select: { vehicleCode: true, make: true, model: true, year: true } },
          seller: { select: { name: true } },
          payments: { where: { deletedAt: null } }
        }
      }),
      prisma.purchase.count({ where })
    ]);

    // Calculate totals for each
    const data = purchases.map(p => {
      const totalPaid = p.payments.reduce((acc, pay) => acc + pay.amount, 0);
      let paymentStatus = "UNPAID";
      if (totalPaid >= p.purchasePrice) paymentStatus = "PAID";
      else if (totalPaid > 0) paymentStatus = "PARTIALLY_PAID";

      return {
        ...p,
        totalPaid,
        remaining: Math.max(0, p.purchasePrice - totalPaid),
        paymentStatus
      };
    });

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createPurchaseHandler(req: Request, context: any, session: any) {
  try {
    const body = await req.json();
    const result = purchaseSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    const { vehicleId, sellerId, purchasePrice, purchaseDate, paymentMethod, notes } = result.data;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    // Check Vehicle
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId, deletedAt: null } });
    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

    // Check Seller
    const seller = await prisma.seller.findUnique({ where: { id: sellerId, deletedAt: null } });
    if (!seller) return NextResponse.json({ error: "Seller not found" }, { status: 404 });

    // Prevent duplicate active purchases for the same vehicle
    const existingActivePurchase = await prisma.purchase.findFirst({
      where: { vehicleId, deletedAt: null }
    });
    if (existingActivePurchase) {
      return NextResponse.json({ error: "Vehicle already has an active purchase record" }, { status: 400 });
    }

    const newPurchase = await prisma.purchase.create({
      data: {
        vehicleId,
        sellerId,
        purchasePrice,
        purchaseDate,
        paymentMethod,
        notes,
        createdById: userId,
      }
    });

    await logAudit("Purchase Created", newPurchase.id, "Purchase", userId, { 
      vehicleId, sellerId, purchasePrice 
    });

    return NextResponse.json({ data: newPurchase }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("purchases.read", getPurchasesHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAuth("purchases.create", createPurchaseHandler as any);
