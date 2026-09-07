import { ColumnDef } from '@tanstack/react-table';
import { UpdateHistoryItem } from '../schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuditChangesDisplay } from '@/components/shared/AuditChangesDisplay';

export const updateHistoryColumns: ColumnDef<UpdateHistoryItem>[] = [
    {
        accessorKey: 'audit_id',
        header: 'رقم السجل',
        cell: ({ row }) => {
            return <div className="font-medium text-gray-500">#{row.original.audit_id}</div>;
        },
    },
    {
        accessorKey: 'entity_type',
        header: 'النوع',
        cell: ({ row }) => {
            const type = row.original.entity_type;
            const action = row.original.action;
            const typeLabel =
                type === 'Order' ? 'طلب' :
                type === 'Return' ? 'مرتجع' :
                'دفعة';
            const actionLabel =
                action === 'DELETE' ? 'حذف' :
                action === 'REVERSE' ? 'عكس' :
                action === 'VOID' ? 'إلغاء' :
                'تعديل';

            return (
                <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {typeLabel}
                    </Badge>
                    {action && action !== 'UPDATE' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                            {actionLabel}
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'entity_id',
        header: 'المرجع',
        cell: ({ row }) => {
            return <div className="font-medium">#{row.original.entity_id}</div>;
        },
    },
    {
        id: 'customer',
        header: 'العميل',
        cell: ({ row }) => {
            const customer = row.original.customer;
            if (!customer) {
                return <span className="text-muted-foreground text-sm">—</span>;
            }
            return (
                <Link
                    to={`/customers/${customer.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                >
                    {customer.name}
                </Link>
            );
        },
    },
    {
        id: 'changes',
        header: 'التعديلات',
        cell: ({ row }) => {
            return (
                <div className="max-w-md">
                    <AuditChangesDisplay changes={row.original.changes} compact />
                </div>
            );
        },
    },
    {
        accessorKey: 'updated_at',
        header: 'تاريخ التعديل',
        cell: ({ row }) => {
            const date = new Date(row.original.updated_at);
            return (
                <div className="flex flex-col">
                    <span className="text-sm">{format(date, 'yyyy/MM/dd', { locale: ar })}</span>
                    <span className="text-xs text-orange-600">{format(date, 'hh:mm a', { locale: ar })}</span>
                </div>
            );
        },
    },
    {
        id: 'updated_by',
        header: 'بواسطة',
        cell: ({ row }) => {
            const user = row.original.updated_by;
            return (
                <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-orange-400" />
                    <span className="text-sm">{user ? user.username : 'مجهول'}</span>
                </div>
            );
        },
    },
];
