import { User } from './schema';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Power, PowerOff, Edit } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUsersStore } from './store';

export function UserActionsCell({ user }: { user: User }) {
    const store = useUsersStore();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">فتح القائمة</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => store.setUserToEdit(user)}>
                    <Edit className="mr-2 h-4 w-4 ml-2" />
                    تعديل البيانات
                </DropdownMenuItem>
                {user.is_active ? (
                    <DropdownMenuItem
                        onClick={() => {
                            if (window.confirm('هل أنت متأكد من تعطيل هذا المستخدم؟')) {
                                store.deleteUser(user.id!);
                            }
                        }}
                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                    >
                        <PowerOff className="mr-2 h-4 w-4 ml-2" />
                        تعطيل المستخدم
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        onClick={() => {
                            if (window.confirm('هل أنت متأكد من إعادة تنشيط هذا المستخدم؟')) {
                                store.restoreUser(user.id!);
                            }
                        }}
                        className="text-green-600 focus:text-green-700 focus:bg-green-50"
                    >
                        <Power className="mr-2 h-4 w-4 ml-2" />
                        تنشيط المستخدم
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
