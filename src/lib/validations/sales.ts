import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  idNumber: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

export const updateCustomerSchema = customerSchema.partial();

export const createSaleSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle ID"),
  customerId: z.string().uuid("Invalid customer ID"),
  salePrice: z.number().min(0, "Sale price must be positive"),
  saleDate: z.string().or(z.date()).transform(val => new Date(val).toISOString()),
  paymentMethod: z.string().optional(),
  notes: z.string().optional()
});

export const updateSaleSchema = createSaleSchema.partial();

export const salePaymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paidAt: z.string().or(z.date()).transform(val => new Date(val).toISOString()),
  method: z.string().optional(),
  receiptNumber: z.string().optional(),
  notes: z.string().optional()
});
