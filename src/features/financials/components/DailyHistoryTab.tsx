import { useEffect } from 'react';
import { useFinancialsStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { FinancialHistoryItem, OrderHistoryItem } from '../schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const isOrder = (item: FinancialHistoryItem): item is OrderHistoryItem => item.type === 'ORDER';

// Helper to format currency if there isn't one available or accessible
const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP'
    }).format(value);
};

export const columns: ColumnDef<FinancialHistoryItem>[] = [
    {
        accessorKey: "id",
        header: "رقم المرجع",
        cell: ({ row }) => {
            const item = row.original;
            return <div className="font-medium">#{item.id}</div>;
        }
    },
    {
        accessorKey: "type",
        header: "النوع",
        cell: ({ row }) => {
            const type = row.original.type;
            return (
                <Badge variant={type === 'ORDER' ? 'default' : 'secondary'} className={type === 'ORDER' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-green-100 text-green-800 hover:bg-green-100'}>
                    {type === 'ORDER' ? 'طلب' : 'دفعة'}
                </Badge>
            );
        }
    },
    {
        accessorKey: "customer.name",
        header: "العميل",
    },
    {
        id: "amount",
        header: "المبلغ",
        cell: ({ row }) => {
            const item = row.original;
            const amount = isOrder(item) ? item.total_amount : item.amount;
            return <div className="font-medium text-primary">{formatCurrency(amount)}</div>;
        }
    },
    {
        id: "details",
        header: "التفاصيل",
        cell: ({ row }) => {
            const item = row.original;
            if (isOrder(item)) {
                return <span className="text-sm text-gray-600">عدد المنتجات: {item.total_items}</span>;
            } else {
                return <span className="text-sm text-gray-600">طريقة الدفع: {item.method}</span>;
            }
        }
    },
    {
        accessorKey: "created_at",
        header: "تاريخ الإنشاء",
        cell: ({ row }) => {
            const date = new Date(row.original.created_at);
            return (
                <div className="flex flex-col">
                    <span className="text-sm">{format(date, 'yyyy/MM/dd', { locale: ar })}</span>
                    <span className="text-xs text-gray-500">{format(date, 'hh:mm a', { locale: ar })}</span>
                </div>
            );
        }
    }
];

export function DailyHistoryTab() {
    const { dailyData, isLoadingDaily, fetchDailyHistory, date } = useFinancialsStore();

    useEffect(() => {
        fetchDailyHistory();
    }, [fetchDailyHistory, date]);

    if (isLoadingDaily) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!dailyData) {
        return <div className="text-center py-12 text-gray-500">لا توجد بيانات متاحة لهذا اليوم.</div>;
    }

    const { summary, history } = dailyData;

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
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="text-lg font-medium mb-4">سجل العمليات اليومية</h3>
                <DataTable columns={[...columns].reverse()} data={history} enablePagination={false} />
            </div>
        </div>
    );
}
