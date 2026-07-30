import api from '@/lib/axios';
import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF',
}

export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
}

export interface AuthResponse {
    success: boolean;
    data: {
        token: string;
        refreshToken: string;
        user: User;
    };
}

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Proceed with local cleanup even if server logout fails
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    getCurrentUser: (): User | null => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));

            const lsUserStr = localStorage.getItem('user');
            const lsUser = lsUserStr ? JSON.parse(lsUserStr) : null;

            return {
                id: decodedPayload.sub,
                email: decodedPayload.email,
                role: decodedPayload.role as UserRole,
                username: decodedPayload.username || decodedPayload.email.split('@')[0],
                isActive: lsUser?.isActive ?? true,
            };
        } catch (error) {
            console.error('Failed to decode token for current user', error);
            const userStr = localStorage.getItem('user');
            if (userStr) return JSON.parse(userStr);
            return null;
        }
    },

    refreshToken: async (token: string): Promise<{ token: string; refreshToken: string }> => {
        const response = await api.post<{ success: boolean; data: { token: string; refreshToken: string } }>('/auth/refresh', {
            refreshToken: token,
        });
        return response.data.data;
    },

    register: async (data: any): Promise<any> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    }
};
