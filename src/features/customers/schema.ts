import { z } from "zod";

export const customerSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    phone: z.string().min(1, { message: "Phone is required." }),
    email: z.string().email().optional().or(z.literal('').or(z.null())),
    address: z.string().optional().or(z.literal('').or(z.null())),
});

export type Customer = z.infer<typeof customerSchema> & {
    total_orders?: number;
    total_paid?: number;
    outstanding_balance?: number;
    created_at?: string;
    created_by?: {
        id: number;
        username: string;
    };
};

export interface FinancialRecord {
    id: number;
    date: string;
    type: 'ORDER' | 'PAYMENT' | 'REFUND'; // inferred from data
    status?: string; // e.g. 'completed', 'deleted', 'reversed'
    referenceId: number;
    description: string;
    amount: number;
    method?: string; // Only for payments
    quantity?: number; // Only for orders
    items?: {
        productName: string;
        quantity: number;
        unitPrice: number;
    }[]; // Only for orders
    discountAmount?: number;
    discountType?: string;
    runningBalance: number;
}

export interface FinancialHistoryResponse {
    success: boolean;
    data: {
        customerId: number;
        customerName: string;
        summary: {
            totalOrders: number;
            totalPaid: number;
            currentBalance: number;
        };
        history: FinancialRecord[];
    };
}

export interface DeletedHistoryRecord {
    id: number;
    type: 'ORDER' | 'PAYMENT';
    description: string;
    amount: number;
    method?: string;
    quantity?: number;
    items?: {
        productName: string;
        quantity: number;
        unitPrice: number;
    }[];
    discountAmount?: number;
    discountType?: string;
    created_at: string;
    deleted_at: string;
    deleted_by: {
        id: number;
        username: string;
    };
}

export interface DeletedHistoryResponse {
    success: boolean;
    data: {
        customerId: number;
        customerName: string;
        summary: {
            totalDeletedOrders: number;
            totalDeletedPayments: number;
            deletedOrdersCount: number;
            deletedPaymentsCount: number;
        };
        history: DeletedHistoryRecord[];
    };
}

export interface UpdateHistoryRecord {
    id: number;
    type: 'ORDER' | 'PAYMENT';
    entity_id: number;
    description: string;
    changes: Record<string, any>;
    updated_by: {
        id: number;
        username: string;
    };
    updated_at: string;
}

export interface UpdateHistoryResponse {
    success: boolean;
    data: {
        customerId: number;
        customerName: string;
        summary: {
            totalUpdates: number;
            orderUpdates: number;
            paymentUpdates: number;
        };
        history: UpdateHistoryRecord[];
    };
}

export interface CustomersResponse {
    success: boolean;
    data: {
        customers: Customer[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
}

export interface PricingHistoryItem {
    product_id: number;
    product_name: string;
    sku: string;
    last_price: number;
    last_sold_at: string;
}

export interface PricingHistoryResponse {
    success: boolean;
    data: PricingHistoryItem[];
}
