import { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { columns } from "./columns";
import { useProductsStore } from "./store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronRight, ChevronLeft, Search } from "lucide-react";
import { ProductForm } from "./ProductForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ProductsPage() {
    const { products, fetchProducts, isDeleted, setFilter, productToEdit, setProductToEdit, meta, searchQuery, setSearchQuery } = useProductsStore();
    const [open, setOpen] = useState(false);
    const [localSearch, setLocalSearch] = useState(searchQuery);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchQuery) {
                setSearchQuery(localSearch);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [localSearch, searchQuery, setSearchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">إدارة المنتجات</h1>
                    <p className="text-muted-foreground">عرض وإدارة المنتجات والأسعار</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة منتج
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة منتج جديد</DialogTitle>
                            <DialogDescription>
                                قم بإدخال بيانات المنتج الجديد.
                            </DialogDescription>
                        </DialogHeader>
                        <ProductForm onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={!!productToEdit} onOpenChange={(val) => !val && setProductToEdit(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>تعديل بيانات المنتج</DialogTitle>
                            <DialogDescription>
                                قم بتحديث بيانات المنتج.
                            </DialogDescription>
                        </DialogHeader>
                        {productToEdit && (
                            <ProductForm
                                initialData={productToEdit}
                                onSuccess={() => setProductToEdit(null)}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex border-b">
                        <button
                            onClick={() => setFilter(false)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${!isDeleted
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            المنتجات النشطة
                        </button>
                        <button
                            onClick={() => setFilter(true)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isDeleted
                                ? 'border-red-500 text-red-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            المحذوفة
                        </button>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="بحث عن منتج..."
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="pl-4 pr-10"
                        />
                    </div>
                </div>

                <DataTable columns={columns} data={products} enablePagination={false} />

                {/* Server-side pagination controls */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex items-center justify-between py-4">
                        <div className="text-sm text-muted-foreground">
                            صفحة {meta.page} من {meta.totalPages} — إجمالي {meta.total} منتج
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchProducts(meta.page - 1)}
                                disabled={meta.page <= 1}
                            >
                                <ChevronRight className="h-4 w-4 ml-2" />
                                السابق
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchProducts(meta.page + 1)}
                                disabled={meta.page >= meta.totalPages}
                            >
                                التالي
                                <ChevronLeft className="h-4 w-4 mr-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
