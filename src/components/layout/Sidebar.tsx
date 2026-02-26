import {
    LayoutDashboard,
    Layers,
    GraduationCap,
    Package,
    Users,
    DollarSign,
    Settings,
    LogOut,
    Bell,
    FileText,
    List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/features/auth/authService';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/', roles: [UserRole.ADMIN] },
    { icon: Layers, label: 'التصنيفات', href: '/categories', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { icon: GraduationCap, label: 'الفصول', href: '/classes', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { icon: Package, label: 'المنتجات', href: '/products', roles: [UserRole.ADMIN, UserRole.MANAGER] },
    // { icon: Users, label: 'الطلاب', href: '/students', roles: [UserRole.ADMIN, UserRole.MANAGER] }, // Replacing this
    { icon: Users, label: 'إدارة المستخدمين', href: '/users', roles: [UserRole.ADMIN] }, // New item for Admin
    { icon: Users, label: 'العملاء', href: '/customers', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF] },
    { icon: DollarSign, label: 'المالية', href: '/finance', roles: [UserRole.ADMIN] },
    // { icon: Users, label: 'إدارة المستخدمين', href: '/users', roles: [UserRole.ADMIN] }, // Removing duplicate if any, or just renaming the other one
    { icon: List, label: 'القيم المرجعية', href: '/references', roles: [UserRole.ADMIN] },
    { icon: Bell, label: 'الإشعارات', href: '/notifications', roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF] },
    { icon: FileText, label: 'سجلات التدقيق', href: '/audit-logs', roles: [UserRole.ADMIN] },
    { icon: Settings, label: 'الإعدادات', href: '/settings', roles: [UserRole.ADMIN, UserRole.MANAGER] },
];

export function Sidebar() {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const userRole = user?.role;

    return (
        <aside className="w-64 bg-white border-l h-screen flex flex-col fixed right-0 top-0 z-50">
            <div className="p-6 border-b flex items-center justify-center">
                <h1 className="text-xl font-bold text-primary">ABAQ LEARNING</h1>
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
