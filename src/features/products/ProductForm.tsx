import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product, productSchema } from "./schema";
import { useProductsStore } from "./store";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { z } from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    initialData?: Product;
    onSuccess?: () => void;
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
    const { addProduct, updateProduct, isLoading } = useProductsStore();

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: initialData?.name || "",
            sku: initialData?.sku || "",
            default_price: initialData?.default_price || 0,
            is_active: initialData?.is_active ?? true,
        },
    });

    const onSubmit = async (values: ProductFormValues) => {
        try {
            if (initialData?.id) {
                await updateProduct(initialData.id, values as Partial<Product>);
                toast.success("تم تحديث بيانات المنتج بنجاح");
            } else {
                await addProduct(values as Product);
                toast.success("تم إضافة المنتج بنجاح");
            }
            onSuccess?.();
            form.reset();
        } catch (error: any) {
            toast.error(error.message || "حدث خطأ غير متوقع");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>اسم المنتج</FormLabel>
                            <FormControl>
                                <Input placeholder="أدخل اسم المنتج" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>الرمز التخزيني (SKU)</FormLabel>
                            <FormControl>
                                <Input placeholder="أدخل SKU" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="default_price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>السعر الافتراضي</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    {...field}
                                    value={field.value as number}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {initialData && (
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>حالة المنتج</FormLabel>
                                <Select onValueChange={(val) => field.onChange(val === "true")} defaultValue={field.value ? "true" : "false"}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر حالة المنتج" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="true">نشط</SelectItem>
                                        <SelectItem value="false">غير نشط</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onSuccess?.()}
                        disabled={isLoading}
                    >
                        إلغاء
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
