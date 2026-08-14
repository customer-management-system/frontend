import { ColumnDef } from '@tanstack/react-table';
import { FinancialHistoryItem, OrderHistoryItem } from '../schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const isOrder = (item: FinancialHistoryItem): item is OrderHistoryItem => item.type === 'ORDER';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EGP',
    }).format(value);
};

export const dailyHistoryColumns: ColumnDef<FinancialHistoryItem>[] = [
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
                <Badge
                    variant={type === 'ORDER' ? 'default' : 'secondary'}
                    className={
                        type === 'ORDER'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                            : 'bg-green-100 text-green-800 hover:bg-green-100'
                    }
                >
                    {type === 'ORDER' ? 'طلب' : 'دفعة'}
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
            const amount = isOrder(item) ? item.total_amount : item.amount;
            return <div className="font-medium text-primary">{formatCurrency(amount)}</div>;
        },
    },
    {
        id: 'details',
        header: 'التفاصيل',
        cell: ({ row }) => {
            const item = row.original;
            if (isOrder(item)) {
                return <span className="text-sm text-gray-600">عدد المنتجات: {item.total_items}</span>;
            }
            return <span className="text-sm text-gray-600">طريقة الدفع: {item.method}</span>;
        },
    },
    {
        accessorKey: 'created_at',
        header: 'تاريخ الإنشاء',
        cell: ({ row }) => {
            const date = new Date(row.original.created_at);
            return (
                <div className="flex flex-col">
                    <span className="text-sm">{format(date, 'yyyy/MM/dd', { locale: ar })}</span>
                    <span className="text-xs text-gray-500">{format(date, 'hh:mm a', { locale: ar })}</span>
                </div>
            );
        },
    },
];
