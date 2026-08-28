import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.coerce.number().positive("المبلغ يجب أن يكون أكبر من 0"),
  date: z.union([z.string(), z.date(), z.literal(""), z.undefined(), z.null()])
    .transform(val => {
      if (!val) return new Date().toISOString();
      return new Date(val).toISOString();
    }),
  description: z.string().nullish().or(z.literal("")).transform(val => val || ""),
  vendorName: z.string().nullish().or(z.literal("")).transform(val => val || ""),
  referenceNumber: z.string().nullish().or(z.literal("")).transform(val => val || ""),
  status: z.enum(["PAID", "UNPAID", "PENDING", "APPROVED"]).default("PENDING"),
  categoryId: z.string().min(1, "يرجى تحديد فئة المصروف"),
  vehicleId: z.string().nullish().or(z.literal("")).transform(val => (val && val !== "all" && val !== "none") ? val : null),
});

export const updateExpenseSchema = createExpenseSchema.partial();
