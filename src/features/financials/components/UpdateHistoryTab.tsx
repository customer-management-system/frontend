import { useEffect } from 'react';
import { useFinancialsStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { UpdateHistoryItem } from '../schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit3, ArrowLeft } from 'lucide-react';

export const columns: ColumnDef<UpdateHistoryItem>[] = [
    {
        accessorKey: "audit_id",
        header: "رقم السجل",
        cell: ({ row }) => {
            return <div className="font-medium text-gray-500">#{row.original.audit_id}</div>;
        }
    },
    {
        accessorKey: "entity_type",
        header: "النوع",
        cell: ({ row }) => {
            const type = row.original.entity_type;
            return (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {type === 'Order' ? 'طلب' : 'دفعة'}
                </Badge>
            );
        }
    },
    {
        accessorKey: "entity_id",
        header: "المرجع",
        cell: ({ row }) => {
            return <div className="font-medium">#{row.original.entity_id}</div>;
        }
    },
    {
        id: "changes",
        header: "التعديلات",
        cell: ({ row }) => {
            const changes = row.original.changes;
            const keys = Object.keys(changes);

            return (
                <div className="flex flex-col gap-2 max-w-xs md:max-w-md">
                    {keys.map(key => (
                        <div key={key} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded">
                            <span className="font-semibold w-24 truncate" title={key}>{key}:</span>
                            <span className="text-red-500 line-through truncate max-w-[100px]" title={String(changes[key].old)}>
                                {String(changes[key].old) || 'فارغ'}
                            </span>
                            <ArrowLeft className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-green-600 font-medium truncate max-w-[100px]" title={String(changes[key].new)}>
                                {String(changes[key].new) || 'فارغ'}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
    },
    {
        accessorKey: "updated_at",
        header: "تاريخ التعديل",
        cell: ({ row }) => {
            const date = new Date(row.original.updated_at);
            return (
                <div className="flex flex-col">
                    <span className="text-sm">{format(date, 'yyyy/MM/dd', { locale: ar })}</span>
                    <span className="text-xs text-orange-600">{format(date, 'hh:mm a', { locale: ar })}</span>
                </div>
            );
        }
    },
    {
        id: "updated_by",
        header: "بواسطة",
        cell: ({ row }) => {
            const user = row.original.updated_by;
            return (
                <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-orange-400" />
                    <span className="text-sm">{user ? user.username : 'مجهول'}</span>
                </div>
            );
        }
    }
];

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
                <DataTable columns={[...columns].reverse()} data={history} enablePagination={false} />
            </div>
        </div>
    );
}
