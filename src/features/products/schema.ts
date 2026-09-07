import { z } from "zod";
import { requiredNonNegativeNumber } from "@/lib/formSchemas";

export const productSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(2, { message: "الاسم يجب أن يكون حرفين على الأقل." }),
    sku: z.string().min(2, { message: "الرمز التخزيني (SKU) مطلوب." }),
    default_price: requiredNonNegativeNumber("أدخل السعر الافتراضي"),
    is_active: z.boolean().default(true),
});

export type Product = z.infer<typeof productSchema> & {
    is_deleted?: boolean;
    created_by?: { id: number; username: string } | null;
    deleted_by?: { id: number; username: string } | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
};

export interface ProductsResponse {
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

export interface ProductResponse {
    success: boolean;
    data: Product;
}

export interface MessageResponse {
    success: boolean;
    data: {
        message: string;
    };
}
