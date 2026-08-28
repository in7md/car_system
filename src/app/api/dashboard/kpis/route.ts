import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getKpisHandler(req: NextRequest, context: any, session: any) {
  try {
    // 1. Total Vehicles Count
    const totalVehicles = await prisma.vehicle.count({ where: { deletedAt: null } });
    
    // 2. Vehicles By Status
    const statusCounts = await prisma.vehicle.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { status: true }
    });

    const getStatusCount = (statusName: string) => 
      statusCounts.find(s => s.status === statusName)?._count.status || 0;

    const readyForSale = getStatusCount("READY_FOR_SALE");
    const underRepair = getStatusCount("UNDER_REPAIR");
    const soldCount = getStatusCount("SOLD");

    // 3. Financials - Purchases (Active Capital)
    // Only count purchases for vehicles that are NOT sold (i.e. currently in inventory)
    const activePurchasesResult = await prisma.purchase.aggregate({
      where: { 
        deletedAt: null, 
        vehicle: { status: { not: "SOLD" } } 
      },
      _sum: { purchasePrice: true }
    });
    const totalActiveCapital = activePurchasesResult._sum.purchasePrice || 0;

    // 4. Financials - Approved Expenses
    const expensesResult = await prisma.expense.aggregate({
      where: { deletedAt: null, status: { in: ["APPROVED", "PAID"] } },
      _sum: { amount: true }
    });
    const totalExpenses = expensesResult._sum.amount || 0;

    // 5. Financials - Sales & Profit
    const sales = await prisma.sale.findMany({
      where: { deletedAt: null },
      select: {
        salePrice: true,
        vehicle: {
          select: {
            purchases: { where: { deletedAt: null }, select: { purchasePrice: true } },
            expenses: { where: { deletedAt: null, status: { in: ["APPROVED", "PAID"] } }, select: { amount: true } }
          }
        },
        payments: { where: { deletedAt: null }, select: { amount: true } }
      }
    });

    let totalSalesRevenue = 0;
    let totalNetProfit = 0;
    let outstandingReceivables = 0;

    sales.forEach(sale => {
      totalSalesRevenue += sale.salePrice;
      
      const purchaseCost = sale.vehicle?.purchases[0]?.purchasePrice || 0;
      const expenseCost = sale.vehicle?.expenses.reduce((acc, exp) => acc + exp.amount, 0) || 0;
      
      totalNetProfit += (sale.salePrice - (purchaseCost + expenseCost));

      const paid = sale.payments.reduce((acc, p) => acc + p.amount, 0);
      outstandingReceivables += (sale.salePrice - paid);
    });

    const averageProfitPerCar = soldCount > 0 ? totalNetProfit / soldCount : 0;

    return NextResponse.json({
      data: {
        totalVehicles,
        readyForSale,
        underRepair,
        soldCount,
        totalActiveCapital,
        totalExpenses,
        totalSalesRevenue,
        totalNetProfit,
        outstandingReceivables,
        averageProfitPerCar
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Ensure only high level roles can view financials. Using dashboard.view or fallback to a custom check.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("dashboard.view", getKpisHandler as any);
