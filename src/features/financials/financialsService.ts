import api from '@/lib/axios';
import { FinancialHistoryResponse, DeletedHistoryResponse, UpdateHistoryResponse } from './schema';

export const financialsService = {
    getDailyHistory: async (
        date: string,
        page = 1,
        limit = 10,
        search = '',
    ): Promise<FinancialHistoryResponse> => {
        const response = await api.get<FinancialHistoryResponse>('/daily-history/financial', {
            params: { date, page, limit, search },
        });
        return response.data;
    },

    getDeletedHistory: async (date: string): Promise<DeletedHistoryResponse> => {
        const response = await api.get<DeletedHistoryResponse>('/daily-history/deleted', {
            params: { date }
        });
        return response.data;
    },

    getUpdateHistory: async (date: string): Promise<UpdateHistoryResponse> => {
        const response = await api.get<UpdateHistoryResponse>('/daily-history/updates', {
            params: { date }
        });
        return response.data;
    }
};
