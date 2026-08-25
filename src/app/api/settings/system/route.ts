import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/authorize";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function getSettingsHandler(req: NextRequest, context: any, session: any) {
  try {
    const settings = await prisma.systemSetting.findMany();
    // Convert to simple key-value object
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any>);

    return NextResponse.json({ data: settingsMap });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
async function updateSettingsHandler(req: NextRequest, context: any, session: any) {
  try {
    const body = await req.json();
    
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        updates.push(
          prisma.systemSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
          })
        );
      }
    }

    await Promise.all(updates);

    await prisma.auditLog.create({
      data: {
        action: "UPDATE_SYSTEM_SETTINGS",
        entityId: "SYSTEM",
        entityType: "SETTINGS",
        userId: session?.user?.id,
        details: body
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = withAuth("settings.manage", getSettingsHandler as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PUT = withAuth("settings.manage", updateSettingsHandler as any);
