import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import { customerSchema } from "@/lib/validations/sales";
import { logAudit } from "@/services/audit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getCustomersHandler(req: NextRequest, context: any, session: any) {
  try {
    const customers = await prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { sales: { where: { deletedAt: null } } } }
      }
    });
    return NextResponse.json({ data: customers });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function createCustomerHandler(req: NextRequest, context: any, session: any) {
  try {
    const body = await req.json();
    const result = customerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Validation Error", details: result.error.format() }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session.user as any).id;
    const customer = await prisma.customer.create({
      data: {
        ...result.data,
        createdById: userId
      }
    });

    await logAudit("Customer Created", customer.id, "Customer", userId, { name: customer.name });
    return NextResponse.json({ data: customer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("customers.read", getCustomersHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAuth("customers.create", createCustomerHandler as any);
