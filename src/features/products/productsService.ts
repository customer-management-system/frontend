import api from '@/lib/axios';
import { Product, ProductsResponse, ProductResponse, MessageResponse } from './schema';

export const productsService = {
    getAll: async (page = 1, limit = 10, search = '', is_deleted = false): Promise<ProductsResponse> => {
        const response = await api.get<ProductsResponse>('/products', {
            params: { page, limit, search, is_deleted }
        });
        return response.data;
    },

    getById: async (id: number): Promise<Product> => {
        const response = await api.get<ProductResponse>(`/products/${id}`);
        return response.data.data;
    },

    create: async (data: Partial<Product>): Promise<Product> => {
        const response = await api.post<ProductResponse>('/products', data);
        return response.data.data;
    },

    update: async (id: number, data: Partial<Product>): Promise<Product> => {
        const response = await api.put<ProductResponse>(`/products/${id}`, data);
        return response.data.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete<MessageResponse>(`/products/${id}`);
    }
};
