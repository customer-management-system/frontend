import { useEffect } from 'react';
import { useFinancialsStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/DataTable';
import { Loader2 } from 'lucide-react';
import { deletedHistoryColumns } from './deleted-history-columns';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
    }).format(value);
};

export function DeletedHistoryTab() {
    const { deletedData, isLoadingDeleted, fetchDeletedHistory, date } = useFinancialsStore();

    useEffect(() => {
        fetchDeletedHistory();
    }, [fetchDeletedHistory, date]);

    if (isLoadingDeleted) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!deletedData) {
        return <div className="text-center py-12 text-gray-500">لا توجد محذوفات في هذا اليوم.</div>;
    }

    const { summary, history } = deletedData;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">الطلبات المحذوفة (عدد)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{summary.deleted_orders_count}</div>
                    </CardContent>
                </Card>
                <Card className="border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">قيمة الطلبات المحذوفة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.deleted_orders_total)}</div>
                    </CardContent>
                </Card>
                <Card className="border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">الدفعات المحذوفة (عدد)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{summary.deleted_payments_count}</div>
                    </CardContent>
                </Card>
                <Card className="border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">قيمة الدفعات المحذوفة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.deleted_payments_total)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-medium mb-4 text-red-700">سجل المحذوفات</h3>
                <DataTable columns={[...deletedHistoryColumns].reverse()} data={history} enablePagination={false} />
            </div>
        </div>
    );
}
