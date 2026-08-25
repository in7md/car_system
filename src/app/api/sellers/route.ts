import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { sellerSchema } from "@/lib/validations/seller";
import { logAudit } from "@/services/audit";
import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSellersHandler(req: Request, context: any, session: any) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Prisma.SellerWhereInput = {
      deletedAt: null,
      OR: search ? [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ] : undefined
    };

    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { purchases: { where: { deletedAt: null } } } } }
      }),
      prisma.seller.count({ where })
    ]);

    return NextResponse.json({ data: sellers, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createSellerHandler(req: Request, context: any, session: any) {
  try {
    const body = await req.json();
    const result = sellerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;

    const newSeller = await prisma.seller.create({
      data: {
        ...result.data,
        createdById: userId,
      }
    });

    await logAudit("Seller Created", newSeller.id, "Seller", userId, { name: newSeller.name });

    return NextResponse.json({ data: newSeller }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("sellers.read", getSellersHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAuth("sellers.create", createSellerHandler as any);
