import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getReportsHandler(req: NextRequest, context: any, session: any) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateFilter: any = {};
    if (startDateStr) dateFilter.gte = new Date(startDateStr);
    if (endDateStr) {
      const eDate = new Date(endDateStr);
      eDate.setHours(23, 59, 59, 999);
      dateFilter.lte = eDate;
    }

    if (type === "sales") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = { deletedAt: null };
      if (startDateStr || endDateStr) where.saleDate = dateFilter;

      const sales = await prisma.sale.findMany({
        where,
        include: {
          customer: true,
          vehicle: { include: { purchases: { where: { deletedAt: null } }, expenses: { where: { deletedAt: null } } } },
          payments: { where: { deletedAt: null } }
        },
        orderBy: { saleDate: 'desc' }
      });

      return NextResponse.json({ data: sales });
    }

    if (type === "expenses") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = { deletedAt: null };
      if (startDateStr || endDateStr) where.date = dateFilter;

      const expenses = await prisma.expense.findMany({
        where,
        include: {
          category: true,
          vehicle: true
        },
        orderBy: { date: 'desc' }
      });

      return NextResponse.json({ data: expenses });
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("reports.view", getReportsHandler as any);
