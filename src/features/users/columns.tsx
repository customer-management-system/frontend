import { ColumnDef } from '@tanstack/react-table';
import { User } from './schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/features/auth/authService';
import { UserActionsCell } from './UserActionsCell';

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'username',
        header: 'اسم المستخدم',
        cell: ({ row }) => <div className="font-medium">{row.getValue('username')}</div>,
    },
    {
        accessorKey: 'email',
        header: 'البريد الإلكتروني',
    },
    {
        accessorKey: 'role',
        header: 'الصلاحية',
        cell: ({ row }) => {
            const role = row.getValue('role') as UserRole;
            return (
                <Badge variant={role === UserRole.ADMIN ? 'default' : role === UserRole.MANAGER ? 'secondary' : 'outline'}>
                    {role === UserRole.ADMIN ? 'مدير نظام' : role === UserRole.MANAGER ? 'صلاحيات محدودة' : 'موظف'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'is_active',
        header: 'الحالة',
        cell: ({ row }) => {
            const isActive = row.getValue('is_active') as boolean;
            return (
                <Badge variant={isActive ? 'default' : 'destructive'}>
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
        cell: ({ row }) => <UserActionsCell user={row.original} />,
    },
];
