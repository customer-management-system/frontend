import { Product } from './schema';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProductsStore } from './store';

export function ProductActionsCell({ product }: { product: Product }) {
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
                        if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
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
}
