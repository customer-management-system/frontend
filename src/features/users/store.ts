import { create } from 'zustand';
import { User, UsersResponse } from './schema';
import { usersService } from './usersService';

interface UsersState {
    users: User[];
    isLoading: boolean;
    error: string | null;
    meta: UsersResponse['data']['pagination'] | null;
    isActive: boolean;

    fetchUsers: (page?: number, limit?: number, search?: string) => Promise<void>;
    addUser: (user: User) => Promise<void>;
    updateUser: (id: number, data: Partial<User>) => Promise<void>;
    deleteUser: (id: number) => Promise<void>;
    restoreUser: (id: number) => Promise<void>;
    setFilter: (isActive: boolean) => void;

    currentUser: User | null;
    userToEdit: User | null;
    fetchUserDetails: (id: number) => Promise<void>;
    setUserToEdit: (user: User | null) => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
    users: [],
    isLoading: false,
    error: null,
    meta: null,
    isActive: true, // Default to true according to the requirement logic
    currentUser: null,
    userToEdit: null,

    setFilter: (isActive: boolean) => {
        set({ isActive });
        get().fetchUsers(1);
    },

    setUserToEdit: (user) => set({ userToEdit: user }),

    fetchUsers: async (page = 1, limit = 10, search = '') => {
        const { isActive } = get();
        set({ isLoading: true, error: null });
        try {
            const response = await usersService.getAll(page, limit, search, isActive);
            set({
                users: response.data.users,
                meta: response.data.pagination,
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch users', isLoading: false });
        }
    },

    addUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
            await usersService.create(userData);
            const { meta } = get();
            await get().fetchUsers(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to add user', isLoading: false });
            throw error;
        }
    },

    updateUser: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
            await usersService.update(id, data);

            set(state => ({
                users: state.users.map(u => u.id === id ? { ...u, ...data } : u)
            }));

            const { currentUser } = get();
            if (currentUser && currentUser.id === id) {
                set({ currentUser: { ...currentUser, ...data } as User });
            }

            const { meta } = get();
            await get().fetchUsers(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to update user', isLoading: false });
            throw error;
        }
    },

    deleteUser: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await usersService.delete(id);
            const { meta } = get();
            await get().fetchUsers(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to deactivate user', isLoading: false });
            throw error;
        }
    },

    restoreUser: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await usersService.restore(id);
            const { meta } = get();
            await get().fetchUsers(meta?.page || 1, meta?.limit || 10);
        } catch (error: any) {
            set({ error: error.message || 'Failed to reactivate user', isLoading: false });
            throw error;
        }
    },

    fetchUserDetails: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const user = await usersService.getById(id);
            set({ currentUser: user, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch user details', isLoading: false });
        }
    },
}));
