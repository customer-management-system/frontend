import { ColumnDef } from "@tanstack/react-table";
import { Product } from "./schema";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProductsStore } from "./store";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: "اسم المنتج",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "sku",
        header: "الرمز التخزيني (SKU)",
    },
    {
        accessorKey: "default_price",
        header: "السعر",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("default_price"));
            return new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(price);
        },
    },
    {
        accessorKey: "is_active",
        header: "الحالة",
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean;
            const isDeleted = row.original.is_deleted;
            if (isDeleted) {
                return <Badge variant="destructive">محذوف</Badge>;
            }
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
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
            const product = row.original;
            const store = useProductsStore();

            if (product.is_deleted) return null;

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
                        <DropdownMenuItem onClick={() => store.setProductToEdit(product)}>
                            <Edit className="mr-2 h-4 w-4 ml-2" />
                            تعديل البيانات
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => {
                                if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
                                    store.deleteProduct(product.id!);
                                }
                            }}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50"
                        >
                            <Trash2 className="mr-2 h-4 w-4 ml-2" />
                            حذف المنتج
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
