import { ColumnDef } from '@tanstack/react-table';
import { Product } from './schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ProductActionsCell } from './ProductActionsCell';

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: 'name',
        header: 'اسم المنتج',
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'sku',
        header: 'الرمز التخزيني (SKU)',
    },
    {
        accessorKey: 'default_price',
        header: 'السعر',
        cell: ({ row }) => {
            const price = parseFloat(row.getValue('default_price'));
            return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
        },
    },
    {
        accessorKey: 'is_active',
        header: 'الحالة',
        cell: ({ row }) => {
            const isActive = row.getValue('is_active') as boolean;
            const isDeleted = row.original.is_deleted;
            if (isDeleted) {
                return <Badge variant="destructive">محذوف</Badge>;
            }
            return (
                <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'نشط' : 'غير نشط'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'تاريخ الإنشاء',
        cell: ({ row }) => {
            const val = row.getValue('created_at') as string | undefined;
            if (!val) return '-';
            return format(new Date(val), 'dd/MM/yyyy', { locale: ar });
        },
    },
    {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => <ProductActionsCell product={row.original} />,
    },
];
