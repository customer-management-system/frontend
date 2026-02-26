import { Bell, Search, User } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function Header() {
    const { user } = useAuthStore();

    return (
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Placeholder for Breadcrumbs or Page Title */}
                <h2 className="text-xl font-semibold text-gray-800">الفئات</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="بحث..."
                        className="pl-4 pr-10 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
                    />
                </div>

                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                </button>

                <div className="flex items-center gap-2 mr-4 border-r pr-4">
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.email || 'email@example.com'}</p>
                    </div>
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </header>
    );
}
