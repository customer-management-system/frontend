import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { categorySchema, Category } from "./schema"
import { Button } from "@/components/ui/button"
// Removed unused imports
import { Input } from "@/components/ui/input"
import { useCategoriesStore } from "./store"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"

// Minimal Form wrapper since we didn't install full shadcn form yet
// But we have react-hook-form installed. I'll mock the Form parts 
// or I should create form.tsx component.
// For now, I'll use direct react-hook-form logic inside here to be faster 
// or implement a simple form.tsx. I'll implement simple form logic here.

interface CategoryFormProps {
    onSuccess: () => void
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
    const { addCategory } = useCategoriesStore()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Category>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            nameEn: "",
            nameAr: "",
            status: "active",
            imageUrl: "",
        },
    })

    const onSubmit = (data: Category) => {
        addCategory(data)
        onSuccess()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
                <label className="text-sm font-medium">الاسم بالإنجليزية</label>
                <Input {...register("nameEn")} placeholder="Example: Marketing" />
                {errors.nameEn && <p className="text-red-500 text-xs">{errors.nameEn.message}</p>}
            </div>

            <div className="grid gap-2">
                <label className="text-sm font-medium">الاسم بالعربية</label>
                <Input {...register("nameAr")} placeholder="مثال: تسويق" className="text-right" />
                {errors.nameAr && <p className="text-red-500 text-xs">{errors.nameAr.message}</p>}
            </div>

            <div className="grid gap-2">
                <label className="text-sm font-medium">رابط الصورة</label>
                <Input {...register("imageUrl")} placeholder="https://..." dir="ltr" />
                {errors.imageUrl && <p className="text-red-500 text-xs">{errors.imageUrl.message}</p>}
            </div>

            <DialogFooter className="mt-6">
                <DialogClose asChild>
                    <Button type="button" variant="outline">إلغاء</Button>
                </DialogClose>
                <Button type="submit">حفظ</Button>
            </DialogFooter>
        </form>
    )
}
