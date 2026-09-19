import { useEffect, useState } from 'react';
import { useFinancialsStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { dailyHistoryColumns } from './daily-history-columns';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
    }).format(value);
};

export function DailyHistoryTab() {
    const {
        dailyData,
        isLoadingDaily,
        fetchDailyHistory,
        date,
        dailySearch,
        setDailySearch,
    } = useFinancialsStore();
    const [localSearch, setLocalSearch] = useState(dailySearch);

    useEffect(() => {
        fetchDailyHistory(1);
    }, [fetchDailyHistory, date]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== dailySearch) {
                setDailySearch(localSearch);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch, dailySearch, setDailySearch]);

    if (isLoadingDaily && !dailyData) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!dailyData) {
        return <div className="text-center py-12 text-gray-500">لا توجد بيانات متاحة لهذا اليوم.</div>;
    }

    const { summary, history, pagination } = dailyData;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الطلبات (العدد)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.total_orders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إيرادات الطلبات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.total_revenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الدفعات (العدد)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.total_payments}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">المحصل النقدي</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_collected)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">المرتجعات (العدد)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.total_returns ?? 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">قيمة المرتجعات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-teal-600">{formatCurrency(summary.total_returned ?? 0)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h3 className="text-lg font-medium">سجل العمليات اليومية</h3>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="بحث باسم المستخدم..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="pl-4 pr-10"
                        />
                    </div>
                </div>
                <DataTable columns={[...dailyHistoryColumns].reverse()} data={history} enablePagination={false} />

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-muted-foreground">
                            صفحة {pagination.page} من {pagination.totalPages} — إجمالي {pagination.total} عملية
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchDailyHistory(pagination.page - 1)}
                                disabled={pagination.page <= 1 || isLoadingDaily}
                            >
                                <ChevronRight className="h-4 w-4 ml-2" />
                                السابق
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchDailyHistory(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages || isLoadingDaily}
                            >
                                التالي
                                <ChevronLeft className="h-4 w-4 mr-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
