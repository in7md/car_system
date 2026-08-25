import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function updateUserHandler(req: NextRequest, context: any, session: any) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { name, roleName, isActive } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { roles: true }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (name) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    if (roleName) {
      // Find role
      let role = await prisma.role.findUnique({ where: { name: roleName } });
      if (!role) {
        role = await prisma.role.create({ data: { name: roleName } });
      }

      // If user has a different role, update it. For simplicity, we just delete existing and create new.
      await prisma.userRole.deleteMany({ where: { userId: id } });
      await prisma.userRole.create({
        data: {
          userId: id,
          roleId: role.id
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_USER",
        entityId: user.id,
        entityType: "USER",
        userId: session?.user?.id,
        details: { updateData, roleName }
      }
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PUT = withAuth("users.manage", updateUserHandler as any);
