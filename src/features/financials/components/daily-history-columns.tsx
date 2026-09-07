import { ColumnDef } from '@tanstack/react-table';
import { FinancialHistoryItem, OrderHistoryItem, PaymentHistoryItem, ReturnHistoryItem } from '../schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { FinancialOrderDetails, FinancialPaymentDetails, FinancialReturnDetails } from '@/components/shared/FinancialRecordDetails';

const isOrder = (item: FinancialHistoryItem): item is OrderHistoryItem => item.type === 'ORDER';
const isPayment = (item: FinancialHistoryItem): item is PaymentHistoryItem => item.type === 'PAYMENT';
const isReturn = (item: FinancialHistoryItem): item is ReturnHistoryItem => item.type === 'RETURN';

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
            if (type === 'ORDER') {
                return (
                    <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        طلب
                    </Badge>
                );
            }
            if (type === 'RETURN') {
                return (
                    <Badge variant="default" className="bg-teal-100 text-teal-800 hover:bg-teal-100">
                        مرتجع
                    </Badge>
                );
            }
            return (
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                    دفعة
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
            const amount = isPayment(item) ? item.amount : item.total_amount;
            const tone = isReturn(item) ? 'text-teal-600' : isPayment(item) ? 'text-green-600' : 'text-primary';
            return <div className={`font-medium ${tone}`}>{formatCurrency(amount)}</div>;
        },
    },
    {
        id: 'details',
        header: 'التفاصيل',
        cell: ({ row }) => {
            const item = row.original;
            if (isOrder(item)) {
                return (
                    <FinancialOrderDetails
                        items={item.items}
                        notes={item.notes}
                        totalItems={item.total_items}
                        discountAmount={item.discount_amount}
                        discountType={item.discount_type}
                        paidAmount={item.paid_amount}
                        balance={item.balance}
                        createdBy={item.created_by}
                        isModified={item.is_modified}
                    />
                );
            }
            if (isReturn(item)) {
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
