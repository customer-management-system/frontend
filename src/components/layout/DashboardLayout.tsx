import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            {/* Sidebar - Fixed Right */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 mr-64 flex flex-col min-h-screen transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
