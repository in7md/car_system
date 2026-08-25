import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Roles & Permissions
  console.log("Seeding Roles...");
  const roles = ["Owner", "Manager", "Accountant", "Employee", "Viewer"];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, description: `System ${roleName} role` },
    });
  }

  // 2. Create Expense Categories
  console.log("Seeding Expense Categories...");
  const categories = [
    "Mechanical", "Electrical", "Tires", "Battery", "Paint", 
    "Bodywork", "Spare Parts", "Cleaning", "Inspection", 
    "Transportation", "Insurance", "Registration", "Fines", "Other"
  ];
  for (const cat of categories) {
    await prisma.expenseCategory.upsert({
      where: { name: cat },
      update: {},
      create: { name: cat, description: `${cat} expenses` },
    });
  }

  // 3. Create Default Accounts (Test Users)
  console.log("Seeding Test Users...");
  const testUsers = [
    { email: "owner@test.com", name: "Owner", role: "Owner" },
    { email: "manager@test.com", name: "Manager", role: "Manager" },
    { email: "employee@test.com", name: "Employee", role: "Employee" },
    { email: "accountant@test.com", name: "Accountant", role: "Accountant" },
    { email: "viewer@test.com", name: "Viewer", role: "Viewer" },
    { email: "admin@example.com", name: "System Admin", role: "Owner" } // Original admin
  ];

  const passwordHash = await bcrypt.hash("password123", 10);

  for (const tu of testUsers) {
    const existing = await prisma.user.findUnique({ where: { email: tu.email } });
    if (!existing) {
      const roleRecord = await prisma.role.findUnique({ where: { name: tu.role } });
      if (roleRecord) {
        await prisma.user.create({
          data: {
            name: tu.name,
            email: tu.email,
            passwordHash: tu.email === "admin@example.com" ? await bcrypt.hash("admin123", 10) : passwordHash,
            isActive: true,
            roles: {
              create: { roleId: roleRecord.id }
            }
          }
        });
        console.log(`User created: ${tu.email}`);
      }
    }
  }

  // 4. Default System Settings
  console.log("Seeding System Settings...");
  const defaultSettings = [
    { key: "businessName", value: "Car Dealership", description: "اسم المعرض الافتراضي" },
    { key: "currency", value: "BHD", description: "العملة الافتراضية" },
    { key: "businessPhone", value: "12345678", description: "رقم الهاتف" },
    { key: "crNumber", value: "000000-1", description: "رقم السجل التجاري" },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        description: setting.description,
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
