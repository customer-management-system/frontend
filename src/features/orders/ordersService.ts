import axios from "axios";
import { CreateOrderRequest, ProductResponse } from "./schema";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
    };
};

export const ordersService = {
    create: async (data: CreateOrderRequest) => {
        const response = await axios.post(`${API_URL}/orders`, data, { headers: getHeaders() });
        return response.data;
    },

    getProducts: async (page = 1, limit = 20, search = "") => {
        const response = await axios.get<ProductResponse>(`${API_URL}/products`, {
            headers: getHeaders(),
            params: { page, limit, search },
        });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await axios.get(`${API_URL}/orders/${id}`, { headers: getHeaders() });
        return response.data;
    },

    update: async (id: number, data: any) => {
        const response = await axios.put(`${API_URL}/orders/${id}`, data, { headers: getHeaders() });
        return response.data;
    },

    delete: async (id: number) => {
        const response = await axios.delete(`${API_URL}/orders/${id}`, { headers: getHeaders() });
        return response.data;
    },

    restore: async (id: number) => {
        const response = await axios.patch(`${API_URL}/orders/${id}/restore`, {}, { headers: getHeaders() });
        return response.data;
    },
};
