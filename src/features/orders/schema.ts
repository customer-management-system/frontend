import { z } from "zod";
import {
    optionalNonNegativeNumber,
    requiredAmount,
    requiredNonNegativeNumber,
    requiredPositiveQuantity,
} from "@/lib/formSchemas";

export enum PaymentMethod {
    CASH = "CASH",
    INSTAPAY = "INSTAPAY",
    VODAFONE_CASH = "VODAFONE_CASH",
    BANK_TRANSFER = "BANK_TRANSFER",
    CHEQUE = "CHEQUE"
}

export enum DiscountType {
    FIXED = "FIXED",
    PERCENTAGE = "PERCENTAGE"
}

export const orderItemSchema = z.object({
    product_id: z.number(),
    product_name: z.string(), // For display purposes
    quantity: requiredPositiveQuantity("أدخل الكمية"),
    unit_price: requiredNonNegativeNumber("أدخل السعر"),
    discount_amount: optionalNonNegativeNumber(),
    discount_type: z.nativeEnum(DiscountType).optional(),
});

export const paymentRequestSchema = z.object({
    amount: requiredAmount("أدخل المبلغ المدفوع"),
    method: z.nativeEnum(PaymentMethod),
    reference_number: z.string().optional(),
    notes: z.string().optional(),
});

export const optionalPaymentFormSchema = z.object({
    amount: optionalNonNegativeNumber(),
    method: z.nativeEnum(PaymentMethod),
    reference_number: z.string().optional(),
    notes: z.string().optional(),
});

export const createOrderSchema = z.object({
    customer_id: z.number(),
    items: z.array(orderItemSchema).min(1, "At least one item is required"),
    discount_amount: optionalNonNegativeNumber(),
    discount_type: z.nativeEnum(DiscountType).optional(),
    payment: optionalPaymentFormSchema.optional(),
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
export type OrderItemRequest = z.infer<typeof orderItemSchema>;
export type PaymentRequest = z.infer<typeof paymentRequestSchema>;

export const updateOrderItemSchema = z.object({
    id: z.number().optional(),
    product_id: z.number().optional(),
    product_name: z.string().optional(),
    quantity: requiredPositiveQuantity("أدخل الكمية"),
    unit_price: requiredNonNegativeNumber("أدخل السعر"),
}).refine((item) => Boolean(item.id || item.product_id), {
    message: "Each item must have an id or product_id",
});

export const updateOrderSchema = z.object({
    items: z.array(updateOrderItemSchema).min(1, "At least one item is required"),
});

export type UpdateOrderRequest = z.infer<typeof updateOrderSchema>;

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product?: { id: number; name: string; sku?: string };
    quantity: number;
    unit_price: string | number;
    subtotal: string | number;
}

export interface OrderPayment {
    id: number;
    amount: string | number;
    method: PaymentMethod;
}

export interface OrderInvoice {
    id: number;
    number: string;
    status: string;
}

export interface OrderData {
    id: number;
    customer_id: number;
    customer?: { id: number; name: string; phone?: string };
    total_amount: string | number;
    paid_amount: string | number;
    balance: string | number;
    discount_amount?: number;
    discount_value?: number;
    discount_type?: string;
    items: OrderItem[];
    payment?: OrderPayment;
    invoice?: OrderInvoice;
    currentTotalBalance?: number;
    created_at: string;
}

export interface CreateOrderResponse {
    success: boolean;
    data: OrderData;
}

export interface Product {
    id: number;
    name: string;
    sku: string;
    default_price: number;
    is_active: true;
    is_deleted: false;
    created_by: null | { id: number; username: string };
    deleted_by: null | { id: number; username: string };
    deleted_at: null | string;
    created_at: string;
}

export interface ProductResponse {
    success: boolean;
    data: {
        products: Product[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}
