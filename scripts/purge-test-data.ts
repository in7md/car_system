import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function purge() {
  console.log('Starting Production Data Purge (Keeping Users, Roles & Expense Categories)...');
  
  try {
    // 1. Sales
    const sp = await prisma.salePayment.deleteMany();
    const s = await prisma.sale.deleteMany();
    
    // 2. Purchases & Sellers
    const pp = await prisma.purchasePayment.deleteMany();
    const p = await prisma.purchase.deleteMany();
    const sel = await prisma.seller.deleteMany();
    
    // 3. Expenses
    const e = await prisma.expense.deleteMany();
    
    // 4. Vehicle related
    const vsh = await prisma.vehicleStatusHistory.deleteMany();
    const va = await prisma.vehicleAssignment.deleteMany();
    const v = await prisma.vehicle.deleteMany();
    
    // 5. Customers
    const c = await prisma.customer.deleteMany();
    
    // 6. AI & Audit
    const sa = await prisma.suspiciousActivity.deleteMany();
    const al = await prisma.auditLog.deleteMany();

    console.log('Purge Complete. Records deleted:');
    console.table({
      SalePayment: sp.count,
      Sale: s.count,
      PurchasePayment: pp.count,
      Purchase: p.count,
      Seller: sel.count,
      Expense: e.count,
      VehicleStatusHistory: vsh.count,
      VehicleAssignment: va.count,
      Vehicle: v.count,
      Customer: c.count,
      SuspiciousActivity: sa.count,
      AuditLog: al.count
    });
  } catch (error) {
    console.error('Error during purge:', error);
  } finally {
    await prisma.$disconnect();
  }
}

purge();

