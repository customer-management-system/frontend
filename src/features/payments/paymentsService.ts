import axios from "axios";
import { CreatePaymentRequest, UpdatePaymentRequest, ReversePaymentRequest } from "./schema";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
    };
};

export const paymentsService = {
    create: async (data: CreatePaymentRequest) => {
        const response = await axios.post(`${API_URL}/payments`, data, { headers: getHeaders() });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await axios.get(`${API_URL}/payments/${id}`, { headers: getHeaders() });
        return response.data;
    },

    update: async (id: number, data: UpdatePaymentRequest) => {
        const response = await axios.patch(`${API_URL}/payments/${id}`, data, { headers: getHeaders() });
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axios.delete(`${API_URL}/payments/${id}`, { headers: getHeaders() });
        return response.data;
    },

    restore: async (id: number) => {
        const response = await axios.patch(`${API_URL}/payments/${id}/restore`, {}, { headers: getHeaders() });
        return response.data;
    },

    reverse: async (id: number, data: ReversePaymentRequest) => {
        const response = await axios.post(`${API_URL}/payments/${id}/reverse`, data, { headers: getHeaders() });
        return response.data;
    }
};
