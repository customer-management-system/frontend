import api from "@/lib/axios";
import { CreatePaymentRequest, UpdatePaymentRequest, ReversePaymentRequest } from "./schema";

export const paymentsService = {
    create: async (data: CreatePaymentRequest) => {
        const response = await api.post('/payments', data);
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/payments/${id}`);
        return response.data;
    },

    update: async (id: number, data: UpdatePaymentRequest) => {
        const response = await api.patch(`/payments/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/payments/${id}`);
        return response.data;
    },

    restore: async (id: number) => {
        const response = await api.patch(`/payments/${id}/restore`, {});
        return response.data;
    },

    reverse: async (id: number, data: ReversePaymentRequest) => {
        const response = await api.post(`/payments/${id}/reverse`, data);
        return response.data;
    }
};
