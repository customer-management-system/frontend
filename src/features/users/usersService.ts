import api from '@/lib/axios';
import { User, UsersResponse, UserResponse, MessageResponse } from './schema';

export const usersService = {
    getAll: async (page = 1, limit = 10, search = '', is_active = true): Promise<UsersResponse> => {
        const response = await api.get<UsersResponse>('/users', {
            params: { page, limit, search, is_active }
        });
        return response.data;
    },

    getById: async (id: number): Promise<User> => {
        const response = await api.get<UserResponse>(`/users/${id}`);
        return response.data.data;
    },

    create: async (data: Partial<User>): Promise<User> => {
        const response = await api.post<UserResponse>('/auth/register', data);
        return response.data.data;
    },

    update: async (id: number, data: Partial<User>): Promise<User> => {
        const response = await api.put<UserResponse>(`/users/${id}`, data);
        return response.data.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete<MessageResponse>(`/users/${id}`);
    },

    restore: async (id: number): Promise<void> => {
        await api.patch<MessageResponse>(`/users/${id}/restore`);
    }
};
