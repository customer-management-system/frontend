import { DataTable } from "@/components/shared/DataTable"
import { columns } from "./columns"
import { useCategoriesStore } from "./store"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CategoryForm } from "./CategoryForm"
import { useState } from "react"

export default function CategoriesPage() {
    const { categories } = useCategoriesStore()
    const [open, setOpen] = useState(false)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">التصنيفات</h1>
                    <p className="text-muted-foreground">إدارة فئات الدورات وتنظيم بنية المحتوى الخاص بك</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة فئة
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>إضافة تصنيف جديد</DialogTitle>
                            <DialogDescription>
                                قم بإدخال بيانات التصنيف الجديد هنا. اضغط حفظ عند الانتهاء.
                            </DialogDescription>
                        </DialogHeader>
                        <CategoryForm onSuccess={() => setOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                {/* Tabs placeholder */}
                <div className="flex border-b mb-6">
                    <button className="px-4 py-2 border-b-2 border-primary text-primary font-medium">نشط</button>
                    <button className="px-4 py-2 text-gray-500 hover:text-gray-700">مسودة</button>
                    <button className="px-4 py-2 text-gray-500 hover:text-gray-700">محذوف</button>
                </div>

                <DataTable columns={columns} data={categories} searchKey="nameEn" />
            </div>
        </div>
    )
}
