import { z } from "zod";
import { PaymentMethod } from "../orders/schema";
import { optionalNonNegativeNumber, requiredAmount } from "@/lib/formSchemas";

export const createPaymentSchema = z.object({
    customer_id: z.number(),
    amount: requiredAmount("أدخل المبلغ"),
    payment_method: z.nativeEnum(PaymentMethod),
    reference_number: z.string().optional(),
    notes: z.string().optional(),
});

export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;

export const updatePaymentSchema = z.object({
    amount: optionalNonNegativeNumber(),
    payment_method: z.nativeEnum(PaymentMethod).optional(),
    reference_number: z.string().optional(),
    notes: z.string().optional(),
}).refine(
    (data) => data.amount !== undefined || data.payment_method !== undefined || data.reference_number !== undefined || data.notes !== undefined,
    { message: "أدخل قيمة واحدة على الأقل للتعديل" },
);

export type UpdatePaymentRequest = z.infer<typeof updatePaymentSchema>;

export const reversePaymentSchema = z.object({
    reason: z.string().min(1, "Reason is required"),
});

export type ReversePaymentRequest = z.infer<typeof reversePaymentSchema>;
