export interface CustomerRef {
    id: number;
    name: string;
    phone: string | null;
}

export interface UserRef {
    id: number;
    username: string;
}

export interface OrderItemRef {
    product_id: number;
    product_name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount_amount: number;
    discount_type: string | null;
}

export interface OrderHistoryItem {
    id: number;
    type: 'ORDER';
    customer: CustomerRef;
    total_amount: number;
    paid_amount: number;
    balance: number;
    discount_amount: number;
    discount_type: 'percentage' | 'fixed' | null;
    is_modified: boolean;
    total_items: number;
    items: OrderItemRef[];
    created_by: UserRef | null;
    created_at: string;
}

export interface PaymentHistoryItem {
    id: number;
    type: 'PAYMENT';
    customer: CustomerRef;
    amount: number;
    method: 'CASH' | 'BANK_TRANSFER' | 'INSTAPAY' | 'CREDIT_CARD' | 'CHEQUE' | 'OTHER';
    status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
    reference_number: string | null;
    notes: string;
    linked_order_id: number | null;
    created_by: UserRef | null;
    created_at: string;
}

export type FinancialHistoryItem = OrderHistoryItem | PaymentHistoryItem;

export interface FinancialSummary {
    total_orders: number;
    total_revenue: number;
    total_payments: number;
    total_collected: number;
}

export interface FinancialHistoryResponse {
    success: boolean;
    data: {
        date: string;
        summary: FinancialSummary;
        history: FinancialHistoryItem[];
    };
}

// Deleted History Types
export interface DeletedOrderHistoryItem extends Omit<OrderHistoryItem, 'type'> {
    type: 'ORDER';
    deleted_at: string;
    deleted_by: UserRef | null;
}

export interface DeletedPaymentHistoryItem extends Omit<PaymentHistoryItem, 'type'> {
    type: 'PAYMENT';
    deleted_at: string;
    deleted_by: UserRef | null;
}

export type DeletedHistoryItem = DeletedOrderHistoryItem | DeletedPaymentHistoryItem;

export interface DeletedSummary {
    deleted_orders_count: number;
    deleted_orders_total: number;
    deleted_payments_count: number;
    deleted_payments_total: number;
}

export interface DeletedHistoryResponse {
    success: boolean;
    data: {
        date: string;
        summary: DeletedSummary;
        history: DeletedHistoryItem[];
    };
}

// Updates History Types
export interface UpdateSummary {
    total_updates: number;
    order_updates: number;
    payment_updates: number;
}

export interface UpdateChangeItem {
    old: unknown;
    new: unknown;
}

export interface UpdateHistoryItem {
    audit_id: number;
    entity_type: 'Order' | 'Payment';
    entity_id: number;
    description: string;
    changes: Record<string, UpdateChangeItem>;
    old_value: unknown;
    new_value: unknown;
    updated_by: UserRef | null;
    updated_at: string;
}

export interface UpdateHistoryResponse {
    success: boolean;
    data: {
        date: string;
        summary: UpdateSummary;
        history: UpdateHistoryItem[];
    };
}
