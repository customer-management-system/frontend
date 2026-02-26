import { create } from 'zustand';
import { Customer, CustomersResponse, FinancialHistoryResponse, DeletedHistoryResponse, UpdateHistoryResponse } from './schema';
import { customersService } from './customersService';

interface CustomersState {
    customers: Customer[];
    isLoading: boolean;
    error: string | null;
    meta: CustomersResponse['data']['pagination'] | null;
    isDeleted: boolean;

    fetchCustomers: (page?: number, limit?: number, search?: string) => Promise<void>;
    addCustomer: (customer: Customer) => Promise<void>;
    updateCustomer: (id: number, data: Partial<Customer>) => Promise<void>;
    deleteCustomer: (id: number) => Promise<void>;
    restoreCustomer: (id: number) => Promise<void>;
    setFilter: (isDeleted: boolean) => void;

    // Details & History
    currentCustomer: Customer | null;
    financialHistory: FinancialHistoryResponse['data'] | null;
    deletedHistory: DeletedHistoryResponse['data'] | null;
    updateHistory: UpdateHistoryResponse['data'] | null;
    customerToEdit: Customer | null; // For the edit dialog
    fetchCustomerDetails: (id: number) => Promise<void>;
    fetchFinancialHistory: (id: number, startDate?: string, endDate?: string) => Promise<void>;
    fetchDeletedHistory: (id: number) => Promise<void>;
    fetchUpdateHistory: (id: number) => Promise<void>;
    setCustomerToEdit: (customer: Customer | null) => void;
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
    customers: [],
    isLoading: false,
    error: null,
    meta: null,
    isDeleted: false,
    currentCustomer: null,
    financialHistory: null,
    deletedHistory: null,
    updateHistory: null,
    customerToEdit: null,

    setFilter: (isDeleted) => {
        set({ isDeleted });
        get().fetchCustomers(1);
    },

    setCustomerToEdit: (customer) => set({ customerToEdit: customer }),

    fetchCustomers: async (page = 1, limit = 10, search = '') => {
        const { isDeleted } = get();
        set({ isLoading: true, error: null });
        try {
            const response = await customersService.getAll(page, limit, search, isDeleted);
            // Check if response has data property, or is the data itself. 
            // Based on service it returns response.data.  
            // If the API returns { data: [...], meta: ... } then:
            set({
                customers: response.data.customers,
                meta: response.data.pagination,
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch customers', isLoading: false });
        }
    },

    addCustomer: async (customerData) => {
        set({ isLoading: true, error: null });
        try {
            await customersService.create(customerData);
            // Refresh list
            const { meta } = get();
            await get().fetchCustomers(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to add customer', isLoading: false });
            throw error;
        }
    },

    updateCustomer: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await customersService.update(id, data);

            // Update in list if exists
            set(state => ({
                customers: state.customers.map(c => c.id === id ? { ...c, ...data } : c)
            }));

            // Update current customer if selected
            const { currentCustomer } = get();
            if (currentCustomer && currentCustomer.id === id) {
                set({ currentCustomer: { ...currentCustomer, ...data } as Customer });
            }

            // Refresh list to be safe
            const { meta } = get();
            await get().fetchCustomers(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to update customer', isLoading: false });
            throw error;
        }
    },

    deleteCustomer: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await customersService.delete(id);
            // Remove from list or refresh
            const { meta } = get();
            await get().fetchCustomers(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete customer', isLoading: false });
            throw error;
        }
    },

    restoreCustomer: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await customersService.restore(id);
            // Refresh list (it should move to active)
            const { meta } = get();
            await get().fetchCustomers(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to restore customer', isLoading: false });
            throw error;
        }
    },

    fetchCustomerDetails: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const customer = await customersService.getById(id);
            set({ currentCustomer: customer, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch customer details', isLoading: false });
        }
    },

    fetchFinancialHistory: async (id, startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
            const response = await customersService.getFinancialHistory(id, startDate, endDate);
            set({ financialHistory: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch financial history', isLoading: false });
        }
    },

    fetchDeletedHistory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await customersService.getDeletedHistory(id);
            set({ deletedHistory: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch deleted history', isLoading: false });
        }
    },

    fetchUpdateHistory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await customersService.getUpdateHistory(id);
            set({ updateHistory: response.data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch update history', isLoading: false });
        }
    },
}));
