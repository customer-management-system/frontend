import { ColumnDef } from "@tanstack/react-table";
import { Customer } from "./schema";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";

export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "name",
        header: () => <div className="text-center">الاسم</div>,
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "phone",
        header: () => <div className="text-center">رقم الهاتف</div>,
        cell: ({ row }) => <div className="text-center" dir="ltr">{row.getValue("phone")}</div>,
    },
    {
        accessorKey: "total_orders",
        header: () => <div className="text-center">عدد الطلبات</div>,
        cell: ({ row }) => <div className="text-center">{row.original.total_orders || 0}</div>,
    },
    {
        accessorKey: "total_paid",
        header: () => <div className="text-center">اجمالي المدفوع</div>,
        cell: ({ row }) => <div className="text-center font-medium text-green-600">{row.original.total_paid || 0}</div>,
    },
    {
        accessorKey: "outstanding_balance",
        header: () => <div className="text-center">المتبقي</div>,
        cell: ({ row }) => <div className="text-center font-medium text-red-600">{row.original.outstanding_balance || 0}</div>,
    },
    {
        accessorKey: "created_by",
        header: () => <div className="text-center">بواسطة</div>,
        cell: ({ row }) => <div className="text-center text-sm text-gray-500">{row.original.created_by?.username || "-"}</div>,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const customer = row.original;
            // We need to pass state to the component to avoid hook rules issues if any, 
            // but for simple components inside cell, using hooks is fine as long as they are components.
            return <ActionsCell customer={customer} />;
        },
    },
];

import { useCustomersStore } from "./store";
import { Eye, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActionsCell = ({ customer }: { customer: Customer }) => {
    const { deleteCustomer, restoreCustomer, setCustomerToEdit, isDeleted } = useCustomersStore();
    const navigate = useNavigate();

    return (
        <div className="flex items-center gap-2 justify-center">
            {isDeleted ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600"
                    onClick={() => {
                        if (confirm("هل أنت متأكد من استعادة هذا العميل؟")) {
                            restoreCustomer(customer.id!);
                        }
                    }}
                    title="استعادة"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            ) : (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600"
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        title="عرض التفاصيل"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600"
                        onClick={() => setCustomerToEdit(customer)}
                        title="تعديل"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600"
                        onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
                                deleteCustomer(customer.id!);
                            }
                        }}
                        title="حذف"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    );
};
