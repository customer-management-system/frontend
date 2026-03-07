import {
    LayoutDashboard,
    Package,
    Users,
    DollarSign,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/features/auth/authService';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/', roles: [UserRole.ADMIN] },
    { icon: Package, label: 'المنتجات', href: '/products', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF] },
    { icon: Users, label: 'إدارة المستخدمين', href: '/users', roles: [UserRole.ADMIN] }, // New item for Admin
    { icon: Users, label: 'العملاء', href: '/customers', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF] },
    { icon: DollarSign, label: 'الماليات', href: '/financials', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF] },
];

export function Sidebar() {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const userRole = user?.role;

    return (
        <aside className="w-64 bg-white border-l h-screen flex flex-col fixed right-0 top-0 z-50">
            <div className="p-6 border-b flex items-center justify-center">
                <h1 className="text-xl font-bold text-primary">SYSTEM</h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                    {sidebarItems.map((item) => {
                        // Filter by role
                        if (userRole && !item.roles.includes(userRole)) {
                            return null;
                        }

                        const isActive = location.pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    to={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-500")} />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-lg" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
}
