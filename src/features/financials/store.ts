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
    dailySearch: string;
    dailyPage: number;
    setDailySearch: (query: string) => void;
    fetchDailyHistory: (page?: number, search?: string) => Promise<void>;

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
    setDate: (date: string) => set({ date, dailyPage: 1 }),

    dailyData: null,
    isLoadingDaily: false,
    dailySearch: '',
    dailyPage: 1,
    setDailySearch: (query) => {
        set({ dailySearch: query, dailyPage: 1 });
        get().fetchDailyHistory(1, query);
    },
    fetchDailyHistory: async (page, search) => {
        const { date, dailySearch, dailyPage } = get();
        const currentPage = page ?? dailyPage;
        const currentSearch = search !== undefined ? search : dailySearch;
        try {
            set({ isLoadingDaily: true, dailyPage: currentPage });
            const response = await financialsService.getDailyHistory(date, currentPage, 10, currentSearch);
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
