import { ColumnDef } from '@tanstack/react-table';
import { DeletedHistoryItem, DeletedOrderHistoryItem, DeletedReturnHistoryItem } from '../schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { FinancialOrderDetails, FinancialPaymentDetails, FinancialReturnDetails } from '@/components/shared/FinancialRecordDetails';

const isDeletedOrder = (item: DeletedHistoryItem): item is DeletedOrderHistoryItem => item.type === 'ORDER';
const isDeletedReturn = (item: DeletedHistoryItem): item is DeletedReturnHistoryItem => item.type === 'RETURN';

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
            const label =
                type === 'ORDER' ? 'طلب محذوف' :
                type === 'RETURN' ? 'مرتجع محذوف' :
                'دفعة محذوفة';
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {label}
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
            const amount = isDeletedOrder(item) || isDeletedReturn(item) ? item.total_amount : item.amount;
            return <div className="font-medium text-red-600 line-through">{formatCurrency(amount)}</div>;
        },
    },
    {
        id: 'details',
        header: 'التفاصيل',
        cell: ({ row }) => {
            const item = row.original;
            if (isDeletedOrder(item)) {
                return (
                    <FinancialOrderDetails
                        items={item.items}
                        notes={item.notes}
                        totalItems={item.total_items}
                        discountAmount={item.discount_amount}
                        discountType={item.discount_type}
                        createdBy={item.created_by}
                    />
                );
            }
            if (isDeletedReturn(item)) {
                return (
                    <FinancialReturnDetails
                        items={item.items}
                        notes={item.notes}
                        totalItems={item.total_items}
                        createdBy={item.created_by}
                    />
                );
            }
            return (
                <FinancialPaymentDetails
                    method={item.method}
                    notes={item.notes}
                    referenceNumber={item.reference_number}
                    linkedOrderId={item.linked_order_id}
                    status={item.status}
                    createdBy={item.created_by}
                />
            );
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
