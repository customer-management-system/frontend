import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { loginSchema, LoginCredentials } from './authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, isLoading, error } = useAuthStore();
    const [loginError, setLoginError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginCredentials) => {
        console.log('LoginPage: onSubmit triggered with data:', data);
        setLoginError(null);
        try {
            console.log('LoginPage: calling login action');
            await login(data);
            console.log('LoginPage: login successful, navigating to home');
            navigate('/');
        } catch (err: any) {
            console.error('LoginPage: error caught', err);
            // Error is already handled in store, but we can set local state if needed
            // or just rely on store error. 
            // The store sets error state, so we can use that if we want global error,
            // but usually for forms we want immediate feedback.
            // Store error might persist appropriately.
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-primary mb-2">ABAQ LEARNING</h1>
                    <p className="text-gray-500">سجل الدخول للمتابعة</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Global Error Message */}
                    {(error || loginError) && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
                            {error || loginError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block text-right">
                            البريد الإلكتروني
                        </label>
                        <div className="relative">
                            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="admin@example.com"
                                className="pr-10"
                                disabled={isLoading}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-xs text-right">{errors.email.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block text-right">
                            كلمة المرور
                        </label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                {...register('password')}
                                type="password"
                                placeholder="••••••"
                                className="pr-10"
                                disabled={isLoading}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs text-right">{errors.password.message}</p>
                        )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                جاري التسجيل...
                            </>
                        ) : (
                            'تسجيل الدخول'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
