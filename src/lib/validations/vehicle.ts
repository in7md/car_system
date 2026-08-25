import { z } from "zod";

export const createVehicleSchema = z.object({
  plateNumber: z.string().optional(),
  plateType: z.string().optional(),
  vehicleBaseNumber: z.string().optional(),
  make: z.string().min(1, "Make is required").optional().or(z.literal("")),
  model: z.string().min(1, "Model is required").optional().or(z.literal("")),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  color: z.string().optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  vin: z.string().optional(),
  mileage: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  status: z.enum([
    "PURCHASED",
    "INSPECTION",
    "UNDER_REPAIR",
    "READY_FOR_SALE",
    "LISTED_FOR_SALE",
    "SOLD",
    "CLOSED"
  ]).optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
