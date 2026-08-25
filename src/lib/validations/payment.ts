import { z } from "zod";

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paidAt: z.string().or(z.date()).transform(val => new Date(val)),
  method: z.string().optional(),
  notes: z.string().optional(),
});
