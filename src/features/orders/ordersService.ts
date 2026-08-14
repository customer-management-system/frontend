import api from "@/lib/axios";
import { CreateOrderRequest, ProductResponse, UpdateOrderRequest } from "./schema";

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

    extraCharge: async (data: { customer_id: number; amount: number }) => {
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
        return response.data;
    },

    update: async (id: number, data: UpdateOrderRequest) => {
        const response = await api.put(`/orders/${id}`, data);
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
