import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";
import bcrypt from "bcryptjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getUsersHandler(req: NextRequest, context: any, session: any) {
  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        roles: {
          include: { role: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json({ data: users });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function createUserHandler(req: NextRequest, context: any, session: any) {
  try {
    const body = await req.json();
    const { name, email, password, roleName } = body;

    if (!email || !password || !name || !roleName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 });
    }

    let role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      // Create role if it doesn't exist for some reason
      role = await prisma.role.create({ data: { name: roleName } });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roles: {
          create: {
            roleId: role.id
          }
        }
      },
      include: {
        roles: { include: { role: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE_USER",
        entityId: user.id,
        entityType: "USER",
        userId: session?.user?.id,
        details: { email: user.email, role: roleName }
      }
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Protect with users.manage or allow only Owner.
// Using custom withAuth here. We will check role inside the handler if needed, but withAuth checks permission.
// The Owner role typically has all permissions.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("users.manage", getUsersHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = withAuth("users.manage", createUserHandler as any);
