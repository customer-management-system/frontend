import { ColumnDef } from '@tanstack/react-table';
import { DeletedHistoryItem, DeletedOrderHistoryItem } from '../schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';

const isDeletedOrder = (item: DeletedHistoryItem): item is DeletedOrderHistoryItem => item.type === 'ORDER';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
    }).format(value);
};

export const deletedHistoryColumns: ColumnDef<DeletedHistoryItem>[] = [
    {
        accessorKey: 'id',
        header: 'رقم المرجع',
        cell: ({ row }) => {
            const item = row.original;
            return <div className="font-medium">#{item.id}</div>;
        },
    },
    {
        accessorKey: 'type',
        header: 'النوع',
        cell: ({ row }) => {
            const type = row.original.type;
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {type === 'ORDER' ? 'طلب محذوف' : 'دفعة محذوفة'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'customer.name',
        header: 'العميل',
    },
    {
        id: 'amount',
        header: 'المبلغ',
        cell: ({ row }) => {
            const item = row.original;
            const amount = isDeletedOrder(item) ? item.total_amount : item.amount;
            return <div className="font-medium text-red-600 line-through">{formatCurrency(amount)}</div>;
        },
    },
    {
        accessorKey: 'deleted_at',
        header: 'تاريخ الحذف',
        cell: ({ row }) => {
            const date = new Date(row.original.deleted_at);
            return (
                <div className="flex flex-col">
                    <span className="text-sm">{format(date, 'yyyy/MM/dd', { locale: ar })}</span>
                    <span className="text-xs text-red-500">{format(date, 'hh:mm a', { locale: ar })}</span>
                </div>
            );
        },
    },
    {
        id: 'deleted_by',
        header: 'بواسطة',
        cell: ({ row }) => {
            const user = row.original.deleted_by;
            return (
                <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user ? user.username : 'مجهول'}</span>
                </div>
            );
        },
    },
];
