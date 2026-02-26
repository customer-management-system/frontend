import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { customerSchema, Customer } from "./schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCustomersStore } from "./store";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

interface CustomerFormProps {
    onSuccess: () => void;
    initialData?: Customer;
}

export function CustomerForm({ onSuccess, initialData }: CustomerFormProps) {
    const { addCustomer, updateCustomer } = useCustomersStore();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<Customer>({
        resolver: zodResolver(customerSchema),
        defaultValues: initialData || {
            name: "",
            phone: "",
            email: "",
            address: "",
        },
    });

    const onSubmit = async (data: Customer) => {
        try {
            if (initialData?.id) {
                await updateCustomer(initialData.id, data);
            } else {
                await addCustomer(data);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
                <label className="text-sm font-medium">الاسم</label>
                <Input {...register("name")} placeholder="محمد محمود" className="text-right" />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="grid gap-2">
                <label className="text-sm font-medium">رقم الهاتف</label>
                <Input {...register("phone")} placeholder="010xxxxxxx" className="text-right" />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
            </div>

            <div className="grid gap-2">
                <label className="text-sm font-medium">البريد الإلكتروني (اختياري)</label>
                <Input {...register("email")} placeholder="example@domain.com" className="text-left" dir="ltr" />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="grid gap-2">
                <label className="text-sm font-medium">العنوان (اختياري)</label>
                <Input {...register("address")} placeholder="Cairo, Egypt" className="text-right" />
                {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
            </div>

            <DialogFooter className="mt-6">
                <DialogClose asChild>
                    <Button type="button" variant="outline">إلغاء</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "جاري الحفظ..." : "حفظ"}
                </Button>
            </DialogFooter>
        </form>
    );
}
