import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding...');

  // 1. Roles & Permissions (If using RBAC via DB, but we mainly use enums/strings for Role)
  console.log('✅ Roles predefined via Schema Enums/Strings.');

  // 2. Default Expense Categories
  const categories = [
    { name: 'ميكانيكا', description: 'أعطال وإصلاحات ميكانيكية' },
    { name: 'كهرباء', description: 'إصلاحات كهربائية وإلكترونية' },
    { name: 'صباغة وسمكرة', description: 'أعمال الصبغ والسمكرة' },
    { name: 'تنجيد', description: 'أعمال التنجيد الداخلي' },
    { name: 'أخرى', description: 'مصروفات متنوعة' }
  ];

  for (const cat of categories) {
    await prisma.expenseCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Expense Categories Seeded.');

  // First, ensure OWNER role exists
  const ownerRole = await prisma.role.upsert({
    where: { name: 'OWNER' },
    update: {},
    create: { name: 'OWNER', description: 'System Owner with full access' }
  });

  const ownerEmail = 'admin@inventrax.com';
  const hashedPassword = await bcrypt.hash('inventrax@2026', 12);
  
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      name: 'Super Admin',
      email: ownerEmail,
      passwordHash: hashedPassword,
      roles: { create: { roleId: ownerRole.id } }
    }
  });
  console.log(`✅ Super Admin Account Seeded (${owner.email}).`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed: ', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
