import { useFinancialsStore } from './store';
import { DailyHistoryTab } from './components/DailyHistoryTab';
import { DeletedHistoryTab } from './components/DeletedHistoryTab';
import { UpdateHistoryTab } from './components/UpdateHistoryTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '../auth/authService';

export default function FinancialsPage() {
    const { date, setDate } = useFinancialsStore();
    const { user } = useAuthStore();
    const isAdmin = user?.role === UserRole.ADMIN;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">الماليات</h1>
                    <p className="text-muted-foreground">إدارة وعرض السجلات المالية اليومية</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm w-full sm:w-auto">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border-0 focus-visible:ring-0 shadow-none p-0 w-[140px]"
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            <Tabs defaultValue="daily" className="w-full">
                <div className="flex justify-end w-full mb-6">
                    <TabsList className={`grid ${isAdmin ? 'grid-cols-3 md:w-[400px]' : 'grid-cols-1 md:w-[150px]'}`}>
                        <TabsTrigger value="daily">اليومية</TabsTrigger>
                        {isAdmin && <TabsTrigger value="deleted">المحذوفات</TabsTrigger>}
                        {isAdmin && <TabsTrigger value="updates">التعديلات</TabsTrigger>}
                    </TabsList>
                </div>

                <TabsContent value="daily" className="mt-0">
                    <DailyHistoryTab />
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="deleted" className="mt-0">
                        <DeletedHistoryTab />
                    </TabsContent>
                )}

                {isAdmin && (
                    <TabsContent value="updates" className="mt-0">
                        <UpdateHistoryTab />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
