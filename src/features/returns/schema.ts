import { z } from "zod";
import { requiredNonNegativeNumber, requiredPositiveQuantity } from "@/lib/formSchemas";

export const returnItemSchema = z.object({
    product_id: z.number(),
    product_name: z.string(),
    quantity: requiredPositiveQuantity("أدخل الكمية"),
    unit_price: requiredNonNegativeNumber("أدخل السعر"),
});

export const createReturnSchema = z.object({
    customer_id: z.number(),
    items: z.array(returnItemSchema).min(1, "At least one item is required"),
    notes: z.string().optional(),
});

export type CreateReturnRequest = z.infer<typeof createReturnSchema>;
export type ReturnItemRequest = z.infer<typeof returnItemSchema>;

export interface ReturnItem {
    id: number;
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: string | number;
    subtotal: string | number;
}

export interface ReturnData {
    id: number;
    customer_id: number;
    customer?: { id: number; name: string; phone?: string };
    total_amount: string | number;
    notes?: string | null;
    items: ReturnItem[];
    currentTotalBalance?: number;
    created_at: string;
    created_by?: { id: number; username: string } | null;
}

export interface CreateReturnResponse {
    success: boolean;
    data: ReturnData;
}
