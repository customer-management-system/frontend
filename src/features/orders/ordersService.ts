import api from "@/lib/axios";
import { CreateOrderRequest, OrderData, OrderItem, ProductResponse, UpdateOrderRequest } from "./schema";

function normalizeOrderItem(item: Record<string, unknown> & {
    product?: { id?: number; name?: string };
    product_id?: number;
    product_name?: string;
    unit_price?: string | number;
    unitPrice?: string | number;
}): OrderItem {
    return {
        id: Number(item.id),
        product_id: Number(item.product_id ?? item.product?.id ?? 0),
        product_name: String(item.product_name ?? item.product?.name ?? ''),
        product: item.product ? { id: item.product.id ?? 0, name: item.product.name ?? '' } : undefined,
        quantity: Number(item.quantity),
        unit_price: item.unit_price ?? item.unitPrice ?? 0,
        subtotal: (item.subtotal as string | number) ?? 0,
    };
}

function normalizeOrder(order: Record<string, unknown> & {
    customer?: { id?: number };
    customer_id?: number;
    items?: unknown[];
}): OrderData {
    return {
        ...(order as unknown as OrderData),
        customer_id: Number(order.customer_id ?? order.customer?.id ?? 0),
        items: (order.items ?? []).map((item) => normalizeOrderItem(item as Parameters<typeof normalizeOrderItem>[0])),
    };
}

function toApiPayload(data: CreateOrderRequest) {
    return {
        customer_id: data.customer_id,
        discount_amount: data.discount_amount,
        discount_type: data.discount_type,
        payment: data.payment,
        items: data.items.map(({ product_id, quantity, unit_price, discount_amount, discount_type }) => ({
            product_id,
            quantity,
            unit_price,
            ...(discount_amount !== undefined ? { discount_amount } : {}),
            ...(discount_type !== undefined ? { discount_type } : {}),
        })),
    };
}

export const ordersService = {
    create: async (data: CreateOrderRequest) => {
        const response = await api.post('/orders', toApiPayload(data));
        return response.data;
    },

    extraCharge: async (data: { customer_id: number; amount: number; notes?: string }) => {
        const response = await api.post('/orders/extra-charge', data);
        return response.data;
    },

    getProducts: async (page = 1, limit = 20, search = "") => {
        const response = await api.get<ProductResponse>('/products', {
            params: { page, limit, search },
        });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/orders/${id}`);
        if (response.data?.success && response.data.data) {
            return {
                ...response.data,
                data: normalizeOrder(response.data.data),
            };
        }
        return response.data;
    },

    update: async (id: number, data: UpdateOrderRequest) => {
        const payload = {
            items: data.items.map((item) => {
                if (item.id) {
                    return {
                        id: item.id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                    };
                }
                return {
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                };
            }),
        };
        const response = await api.put(`/orders/${id}`, payload);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/orders/${id}`);
        return response.data;
    },

    restore: async (id: number) => {
        const response = await api.patch(`/orders/${id}/restore`, {});
        return response.data;
    },
};
