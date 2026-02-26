import { ColumnDef } from "@tanstack/react-table";
import { User } from "./schema";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Power, PowerOff, Edit } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUsersStore } from "./store";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/features/auth/authService";

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "username",
        header: "اسم المستخدم",
        cell: ({ row }) => <div className="font-medium">{row.getValue("username")}</div>,
    },
    {
        accessorKey: "email",
        header: "البريد الإلكتروني",
    },
    {
        accessorKey: "role",
        header: "الصلاحية",
        cell: ({ row }) => {
            const role = row.getValue("role") as UserRole;
            return (
                <Badge variant={role === UserRole.ADMIN ? "default" : role === UserRole.MANAGER ? "secondary" : "outline"}>
                    {role === UserRole.ADMIN ? "مدير نظام" : role === UserRole.MANAGER ? "صلاحيات محدودة" : "موظف"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: "الحالة",
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean;
            return (
                <Badge variant={isActive ? "default" : "destructive"}>
                    {isActive ? "نشط" : "غير نشط"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "created_at",
        header: "تاريخ الإنشاء",
        cell: ({ row }) => {
            const val = row.getValue("created_at") as string | undefined;
            if (!val) return "-";
            return format(new Date(val), "dd/MM/yyyy", { locale: ar });
        },
    },
    {
        id: "actions",
        header: "الإجراءات",
        cell: ({ row }) => {
            const user = row.original;
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
                                    if (window.confirm("هل أنت متأكد من تعطيل هذا المستخدم؟")) {
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
                                    if (window.confirm("هل أنت متأكد من إعادة تنشيط هذا المستخدم؟")) {
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
        },
    },
];
