import { create } from 'zustand';
import { User, authService, LoginCredentials } from '@/features/auth/authService';
import { getErrorMessage } from '@/lib/getErrorMessage';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: authService.getCurrentUser(),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login(credentials);
            const { token, refreshToken, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error: unknown) {
            set({
                isLoading: false,
                error: getErrorMessage(error, 'Login failed')
            });
            throw error;
        }
    },

    logout: async () => {
        await authService.logout();
        set({
            user: null,
            token: null,
            isAuthenticated: false
        });
    },

    checkAuth: () => {
        const token = localStorage.getItem('token');
        const user = authService.getCurrentUser();
        if (token && user) {
            set({ token, user, isAuthenticated: true });
        } else {
            set({ token: null, user: null, isAuthenticated: false });
        }
    },
}));
