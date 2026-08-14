import { ColumnDef } from '@tanstack/react-table';
import { Customer } from './schema';
import { CustomerActionsCell } from './CustomerActionsCell';

export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: 'name',
        header: () => <div className="text-center">الاسم</div>,
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'phone',
        header: () => <div className="text-center">رقم الهاتف</div>,
        cell: ({ row }) => <div className="text-center" dir="ltr">{row.getValue('phone')}</div>,
    },
    {
        accessorKey: 'total_orders',
        header: () => <div className="text-center">عدد الطلبات</div>,
        cell: ({ row }) => <div className="text-center">{row.original.total_orders || 0}</div>,
    },
    {
        accessorKey: 'total_paid',
        header: () => <div className="text-center">اجمالي المدفوع</div>,
        cell: ({ row }) => <div className="text-center font-medium text-green-600">{row.original.total_paid || 0}</div>,
    },
    {
        accessorKey: 'outstanding_balance',
        header: () => <div className="text-center">المتبقي</div>,
        cell: ({ row }) => <div className="text-center font-medium text-red-600">{row.original.outstanding_balance || 0}</div>,
    },
    {
        accessorKey: 'created_by',
        header: () => <div className="text-center">بواسطة</div>,
        cell: ({ row }) => <div className="text-center text-sm text-gray-500">{row.original.created_by?.username || '-'}</div>,
    },
    {
        id: 'actions',
        cell: ({ row }) => <CustomerActionsCell customer={row.original} />,
    },
];
