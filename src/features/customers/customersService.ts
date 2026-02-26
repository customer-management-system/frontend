import api from '@/lib/axios';
import { Customer, CustomersResponse, FinancialHistoryResponse, PricingHistoryResponse, DeletedHistoryResponse, UpdateHistoryResponse } from './schema';

export const customersService = {
    getAll: async (page = 1, limit = 10, search = '', is_deleted = false): Promise<CustomersResponse> => {
        const response = await api.get<CustomersResponse>('/customers', {
            params: { page, limit, search, is_deleted }
        });
        return response.data;
    },

    create: async (data: Customer): Promise<Customer> => {
        const response = await api.post<Customer>('/customers', data);
        return response.data;
    },

    getById: async (id: number): Promise<Customer> => {
        const response = await api.get<{ success: boolean; data: Customer }>(`/customers/${id}`);
        return response.data.data;
    },

    update: async (id: number, data: Partial<Customer>): Promise<Customer> => {
        const response = await api.put<Customer>(`/customers/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/customers/${id}`);
    },

    restore: async (id: number): Promise<void> => {
        await api.patch(`/customers/${id}/restore`);
    },

    getFinancialHistory: async (id: number, startDate?: string, endDate?: string): Promise<FinancialHistoryResponse> => {
        const response = await api.get<FinancialHistoryResponse>(`/customers/${id}/financial-history`, {
            params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
    },

    getPricingHistory: async (id: number): Promise<PricingHistoryResponse> => {
        const response = await api.get<PricingHistoryResponse>(`/customers/${id}/pricing-history`);
        return response.data;
    },

    getDeletedHistory: async (id: number): Promise<DeletedHistoryResponse> => {
        const response = await api.get<DeletedHistoryResponse>(`/customers/${id}/deleted-history`);
        return response.data;
    },

    getUpdateHistory: async (id: number): Promise<UpdateHistoryResponse> => {
        const response = await api.get<UpdateHistoryResponse>(`/customers/${id}/update-history`);
        return response.data;
    }
};
