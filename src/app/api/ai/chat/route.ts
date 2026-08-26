import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = ((session.user as any).role || "").toUpperCase();
    if (userRole !== "OWNER" && userRole !== "ACCOUNTANT" && userRole !== "MANAGER") {
      return NextResponse.json({ success: false, error: "لا تملك صلاحية لاستخدام المساعد الذكي" }, { status: 403 });
    }

    const { message } = await req.json();

    // Since we don't have an actual Vercel AI SDK setup or Gemini API key right now, 
    // we will build a robust pattern-matching mock that fetches REAL data from Prisma
    // to simulate "Secure Server-side Tools / Structured Queries".

    const lowerMsg = message.toLowerCase();
    
    // TOOL 1: Capital Summary
    if (lowerMsg.includes("رأس المال") || lowerMsg.includes("استثمار")) {
      const activeVehicles = await prisma.vehicle.findMany({
        where: { status: { in: ['READY_FOR_SALE', 'UNDER_REPAIR', 'INSPECTION', 'PURCHASED'] } },
        include: { purchases: true, expenses: { where: { status: 'PAID' } } }
      });

      let totalCapital = 0;
      activeVehicles.forEach(v => {
        const p = v.purchases[0]?.purchasePrice || 0;
        const e = v.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        totalCapital += (p + e);
      });

      return NextResponse.json({ 
        reply: `إجمالي رأس المال المستثمر حالياً في السيارات غير المباعة هو **${totalCapital.toLocaleString()} د.ك**.` 
      });
    }
    
    // TOOL 2: Profit Summary
    if (lowerMsg.includes("ربح") || lowerMsg.includes("ارباح") || lowerMsg.includes("أرباح")) {
      const soldVehicles = await prisma.vehicle.findMany({
        where: { status: 'SOLD' },
        include: { purchases: true, expenses: { where: { status: 'PAID' } }, sales: true }
      });

      let totalProfit = 0;
      soldVehicles.forEach(v => {
        const p = v.purchases[0]?.purchasePrice || 0;
        const e = v.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const s = v.sales[0]?.salePrice || 0;
        totalProfit += (s - (p + e));
      });

      return NextResponse.json({ 
        reply: `مجموع الأرباح المحققة من السيارات المباعة حتى الآن هو **${totalProfit.toLocaleString()} د.ك**.` 
      });
    }

    // TOOL 3: Expense Analysis
    if (lowerMsg.includes("مصروف") || lowerMsg.includes("صرفنا")) {
      const expenses = await prisma.expense.aggregate({
        _sum: { amount: true },
        where: { status: 'PAID' }
      });
      return NextResponse.json({ 
        reply: `إجمالي المصروفات المعتمدة (المدفوعة) في النظام هو **${(expenses._sum.amount || 0).toLocaleString()} د.ك**.` 
      });
    }

    // TOOL 4: Suspicious Activity Check
    if (lowerMsg.includes("مشبوه") || lowerMsg.includes("تنبيه") || lowerMsg.includes("تلاعب")) {
      const suspicious = await prisma.suspiciousActivity.count({
        where: { status: 'OPEN' }
      });
      return NextResponse.json({ 
        reply: `يوجد حالياً **${suspicious}** تنبيهات لعمليات مشبوهة (تحتاج إلى مراجعة). يرجى مراجعتها من لوحة الإدارة.` 
      });
    }

    // Fallback
    return NextResponse.json({ 
      reply: "مرحباً بك! أنا المساعد المالي الذكي لـ InventraX. يمكنني تزويدك بملخصات حول: الأرباح، رأس المال المستثمر، إجمالي المصروفات، والعمليات المشبوهة. كيف يمكنني مساعدتك اليوم؟" 
    });
    
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return NextResponse.json({ error: "فشل في التواصل مع المساعد الذكي" }, { status: 500 });
  }
}
