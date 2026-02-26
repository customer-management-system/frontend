import { z } from "zod";
import { PaymentMethod } from "../orders/schema";

export const createPaymentSchema = z.object({
    customer_id: z.number(),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    payment_method: z.nativeEnum(PaymentMethod),
    reference_number: z.string().optional(),
    notes: z.string().optional(),
});

export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;

export const updatePaymentSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0").optional(),
    payment_method: z.nativeEnum(PaymentMethod).optional(),
    reference_number: z.string().optional(),
    notes: z.string().optional(),
});

export type UpdatePaymentRequest = z.infer<typeof updatePaymentSchema>;

export const reversePaymentSchema = z.object({
    reason: z.string().min(1, "Reason is required"),
});

export type ReversePaymentRequest = z.infer<typeof reversePaymentSchema>;
