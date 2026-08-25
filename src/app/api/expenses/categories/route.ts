import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getCategoriesHandler(req: Request, context: any, session: any) {
  try {
    let categories = await prisma.expenseCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" }
    });

    if (categories.length === 0) {
      // Auto-seed default categories
      const defaults = ["إصلاح وصيانة", "نقل وشحن", "تسويق وإعلان", "رسوم إدارية וחكومية", "أخرى"];
      await prisma.expenseCategory.createMany({
        data: defaults.map(name => ({ name }))
      });
      categories = await prisma.expenseCategory.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" }
      });
    }

    return NextResponse.json({ data: categories });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("expenses.read", getCategoriesHandler as any);
