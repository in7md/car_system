import { z } from "zod";

export const purchaseSchema = z.object({
  vehicleId: z.string().uuid("Invalid Vehicle ID"),
  sellerId: z.string().uuid("Invalid Seller ID"),
  purchasePrice: z.coerce.number().positive("Purchase price must be greater than 0"),
  purchaseDate: z.string().or(z.date()).transform(val => new Date(val)),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});
