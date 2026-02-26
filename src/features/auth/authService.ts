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
        console.log('AuthService: login called', credentials);
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            console.log('AuthService: response received', response);
            return response.data;
        } catch (error) {
            console.error('AuthService: error in login request', error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: (): User | null => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            // Decode the JWT payload. Format: Header.Payload.Signature
            const payload = token.split('.')[1];
            // atob decodes base64 string
            const decodedPayload = JSON.parse(atob(payload));

            // Reconstruct user object from token payload directly

            // For fields not in token, try to grab from parsed local storage as a fallback
            const lsUserStr = localStorage.getItem('user');
            const lsUser = lsUserStr ? JSON.parse(lsUserStr) : null;

            return {
                id: decodedPayload.sub,
                email: decodedPayload.email,
                role: decodedPayload.role as UserRole,
                username: decodedPayload.username || decodedPayload.email.split('@')[0], // Fallback if username isn't in token
                isActive: lsUser?.isActive ?? true,
            };
        } catch (error) {
            console.error('Failed to decode token for current user', error);
            // Fallback to local storage if token decode fails (though token should be the source of truth)
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
