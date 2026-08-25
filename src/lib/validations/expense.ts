import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().or(z.date()).transform(val => new Date(val).toISOString()),
  description: z.string().optional(),
  vendorName: z.string().optional(),
  referenceNumber: z.string().optional(),
  status: z.enum(["PAID", "UNPAID", "PENDING", "APPROVED"]).default("PENDING"),
  categoryId: z.string().uuid("Invalid category ID"),
  vehicleId: z.string().uuid("Invalid vehicle ID").optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();
