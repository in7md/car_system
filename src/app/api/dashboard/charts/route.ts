import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getChartsHandler(req: NextRequest, context: any, session: any) {
  try {
    // 1. Monthly Sales & Profit
    const sales = await prisma.sale.findMany({
      where: { deletedAt: null },
      include: {
        vehicle: {
          include: {
            purchases: { where: { deletedAt: null } },
            expenses: { where: { deletedAt: null, status: { in: ["APPROVED", "PAID"] } } }
          }
        }
      },
      orderBy: { saleDate: "asc" }
    });

    // Group by Month
    const monthlyDataMap = new Map<string, { month: string; sales: number; profit: number }>();
    
    // 2. Profit by Make
    const profitByMakeMap = new Map<string, number>();

    sales.forEach(sale => {
      const date = new Date(sale.saleDate);
      // Format YYYY-MM
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      const purchaseCost = sale.vehicle?.purchases[0]?.purchasePrice || 0;
      const expenseCost = sale.vehicle?.expenses.reduce((acc, exp) => acc + exp.amount, 0) || 0;
      const profit = sale.salePrice - (purchaseCost + expenseCost);

      if (!monthlyDataMap.has(monthStr)) {
        monthlyDataMap.set(monthStr, { month: monthStr, sales: 0, profit: 0 });
      }
      const mData = monthlyDataMap.get(monthStr)!;
      mData.sales += sale.salePrice;
      mData.profit += profit;

      // Make
      const make = sale.vehicle?.make || "غير محدد";
      profitByMakeMap.set(make, (profitByMakeMap.get(make) || 0) + profit);
    });

    const monthlySalesTrend = Array.from(monthlyDataMap.values());
    const profitByMake = Array.from(profitByMakeMap.entries()).map(([name, value]) => ({ name, value }));

    // 3. Expenses by Category
    const expenses = await prisma.expense.findMany({
      where: { deletedAt: null, status: { in: ["APPROVED", "PAID"] } },
      include: { category: true }
    });

    const expenseCategoryMap = new Map<string, number>();
    expenses.forEach(exp => {
      const cat = exp.category?.name || "بدون تصنيف";
      expenseCategoryMap.set(cat, (expenseCategoryMap.get(cat) || 0) + exp.amount);
    });
    
    const expensesByCategory = Array.from(expenseCategoryMap.entries()).map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      data: {
        monthlySalesTrend,
        profitByMake,
        expensesByCategory
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("dashboard.view", getChartsHandler as any);
