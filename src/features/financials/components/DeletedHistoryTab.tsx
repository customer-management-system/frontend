import { useEffect } from 'react';
import { useFinancialsStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { DeletedHistoryItem, DeletedOrderHistoryItem } from '../schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2 } from 'lucide-react';

const isDeletedOrder = (item: DeletedHistoryItem): item is DeletedOrderHistoryItem => item.type === 'ORDER';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP'
    }).format(value);
};

export const columns: ColumnDef<DeletedHistoryItem>[] = [
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
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {type === 'ORDER' ? 'طلب محذوف' : 'دفعة محذوفة'}
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
            const amount = isDeletedOrder(item) ? item.total_amount : item.amount;
            return <div className="font-medium text-red-600 line-through">{formatCurrency(amount)}</div>;
        }
    },
    {
        accessorKey: "deleted_at",
        header: "تاريخ الحذف",
        cell: ({ row }) => {
            const date = new Date(row.original.deleted_at);
            return (
                <div className="flex flex-col">
                    <span className="text-sm">{format(date, 'yyyy/MM/dd', { locale: ar })}</span>
                    <span className="text-xs text-red-500">{format(date, 'hh:mm a', { locale: ar })}</span>
                </div>
            );
        }
    },
    {
        id: "deleted_by",
        header: "بواسطة",
        cell: ({ row }) => {
            const user = row.original.deleted_by;
            return (
                <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user ? user.username : 'مجهول'}</span>
                </div>
            );
        }
    }
];

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
                <DataTable columns={[...columns].reverse()} data={history} enablePagination={false} />
            </div>
        </div>
    );
}
