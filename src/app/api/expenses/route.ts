import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { createExpenseSchema } from "@/lib/validations/expense";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getExpensesHandler(req: NextRequest, context: any, session: any) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const categoryId = searchParams.get("categoryId");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { deletedAt: null };
    if (vehicleId) where.vehicleId = vehicleId;
    if (categoryId) where.categoryId = categoryId;

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        category: true,
        vehicle: true,
        createdBy: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ data: expenses });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function createExpenseHandler(req: NextRequest, context: any, session: any) {
  try {
    const body = await req.json();
    const result = createExpenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRole = ((session.user as any).role || "").toUpperCase();
    
    const { vehicleId, categoryId, amount, date, description, vendorName, referenceNumber, status } = result.data;

    const finalStatus = status || "PAID";
    // Direct approval requested, no pending force needed.

    let finalCategoryId = categoryId;
    
    // If it's a fallback ID, we must find or create it in the database by name
    if (categoryId.startsWith("fallback-")) {
      const fallbackNames: Record<string, string> = {
        "fallback-1": "ميكانيك", "fallback-2": "كهرباء", "fallback-3": "إطارات",
        "fallback-4": "بطارية", "fallback-5": "صبغ", "fallback-6": "سمكرة",
        "fallback-7": "قطع غيار", "fallback-8": "تنظيف", "fallback-9": "فحص",
        "fallback-10": "نقل", "fallback-11": "تأمين", "fallback-12": "تسجيل",
        "fallback-13": "مخالفات", "fallback-14": "أخرى",
      };
      const catName = fallbackNames[categoryId] || "أخرى";
      
      let dbCat = await prisma.expenseCategory.findUnique({ where: { name: catName } });
      if (!dbCat) {
        dbCat = await prisma.expenseCategory.create({ data: { name: catName } });
      }
      finalCategoryId = dbCat.id;
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        amount,
        date: new Date(date),
        description,
        vendorName,
        referenceNumber,
        status: finalStatus,
        categoryId: finalCategoryId,
        vehicleId: vehicleId || null,
        createdById: userId
      },
      include: { category: true }
    });

    // -------------------------------------------------------------
    // SUSPICIOUS ACTIVITY DETECTION (AI AI-Suite)
    // -------------------------------------------------------------
    
    // 1. High Amount Check
    const similarExpenses = await prisma.expense.findMany({
      where: { categoryId: finalCategoryId, deletedAt: null }
    });
    
    if (similarExpenses.length >= 3) {
      const totalAmount = similarExpenses.reduce((sum, e) => sum + e.amount, 0);
      const avgAmount = totalAmount / similarExpenses.length;
      
      if (amount > avgAmount * 2) {
        await prisma.suspiciousActivity.create({
          data: {
            type: "HIGH_AMOUNT",
            description: `المصروف #${expense.id} بمبلغ ${amount} يتجاوز بكثير متوسط الصرف لهذه الفئة (${avgAmount.toFixed(2)}).`,
            expenseId: expense.id,
            employeeId: userId,
            status: "OPEN"
          }
        });
      }
    }

    // 2. Rapid Frequency Check
    if (vendorName) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentToVendor = await prisma.expense.count({
        where: {
          createdById: userId,
          vendorName,
          createdAt: { gte: oneHourAgo }
        }
      });
      
      if (recentToVendor >= 3) {
        await prisma.suspiciousActivity.create({
          data: {
            type: "RAPID_FREQUENCY",
            description: `الموظف أدخل أكثر من 3 فواتير لنفس المورد (${vendorName}) خلال ساعة واحدة.`,
            expenseId: expense.id,
            employeeId: userId,
            status: "OPEN"
          }
        });
      }
    }

    // -------------------------------------------------------------

    await logAudit("Expense Created", expense.id, "Expense", userId, { 
      amount, 
      category: expense.category.name,
      vehicleId
    });

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("expenses.read", getExpensesHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAuth("expenses.create", createExpenseHandler as any);
