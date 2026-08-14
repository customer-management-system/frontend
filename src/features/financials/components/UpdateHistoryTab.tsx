import { useEffect } from 'react';
import { useFinancialsStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/DataTable';
import { Loader2 } from 'lucide-react';
import { updateHistoryColumns } from './update-history-columns';

export function UpdateHistoryTab() {
    const { updatesData, isLoadingUpdates, fetchUpdateHistory, date } = useFinancialsStore();

    useEffect(() => {
        fetchUpdateHistory();
    }, [fetchUpdateHistory, date]);

    if (isLoadingUpdates) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!updatesData) {
        return <div className="text-center py-12 text-gray-500">لا توجد تعديلات في هذا اليوم.</div>;
    }

    const { summary, history } = updatesData;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-orange-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-800">إجمالي التعديلات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{summary.total_updates}</div>
                    </CardContent>
                </Card>
                <Card className="border-orange-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-800">تعديلات الطلبات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{summary.order_updates}</div>
                    </CardContent>
                </Card>
                <Card className="border-orange-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-800">تعديلات الدفعات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{summary.payment_updates}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm flex-1 overflow-x-auto">
                <h3 className="text-lg font-medium mb-4 text-orange-700">سجل التعديلات</h3>
                <DataTable columns={[...updateHistoryColumns].reverse()} data={history} enablePagination={false} />
            </div>
        </div>
    );
}
