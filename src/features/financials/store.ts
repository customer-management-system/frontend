import { create } from 'zustand';
import { financialsService } from './financialsService';
import { FinancialHistoryResponse, DeletedHistoryResponse, UpdateHistoryResponse } from './schema';
import { format } from 'date-fns';

interface FinancialsState {
    date: string; // YYYY-MM-DD
    setDate: (date: string) => void;

    // Daily History
    dailyData: FinancialHistoryResponse['data'] | null;
    isLoadingDaily: boolean;
    fetchDailyHistory: () => Promise<void>;

    // Deleted History
    deletedData: DeletedHistoryResponse['data'] | null;
    isLoadingDeleted: boolean;
    fetchDeletedHistory: () => Promise<void>;

    // Updates History
    updatesData: UpdateHistoryResponse['data'] | null;
    isLoadingUpdates: boolean;
    fetchUpdateHistory: () => Promise<void>;
}

export const useFinancialsStore = create<FinancialsState>((set, get) => ({
    date: format(new Date(), 'yyyy-MM-dd'),
    setDate: (date: string) => set({ date }),

    dailyData: null,
    isLoadingDaily: false,
    fetchDailyHistory: async () => {
        try {
            set({ isLoadingDaily: true });
            const response = await financialsService.getDailyHistory(get().date);
            set({ dailyData: response.data, isLoadingDaily: false });
        } catch (error) {
            console.error('Error fetching daily history:', error);
            set({ isLoadingDaily: false });
        }
    },

    deletedData: null,
    isLoadingDeleted: false,
    fetchDeletedHistory: async () => {
        try {
            set({ isLoadingDeleted: true });
            const response = await financialsService.getDeletedHistory(get().date);
            set({ deletedData: response.data, isLoadingDeleted: false });
        } catch (error) {
            console.error('Error fetching deleted history:', error);
            set({ isLoadingDeleted: false });
        }
    },

    updatesData: null,
    isLoadingUpdates: false,
    fetchUpdateHistory: async () => {
        try {
            set({ isLoadingUpdates: true });
            const response = await financialsService.getUpdateHistory(get().date);
            set({ updatesData: response.data, isLoadingUpdates: false });
        } catch (error) {
            console.error('Error fetching update history:', error);
            set({ isLoadingUpdates: false });
        }
    }
}));
