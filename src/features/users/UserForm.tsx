import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, userSchema } from "./schema";
import { useUsersStore } from "./store";
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
import { UserRole } from "@/features/auth/authService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { z } from "zod";

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
    initialData?: User;
    onSuccess?: () => void;
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
    const { addUser, updateUser, isLoading } = useUsersStore();

    const form = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: initialData?.username || "",
            email: initialData?.email || "",
            password: "",
            role: initialData?.role || UserRole.STAFF,
            is_active: initialData?.is_active ?? true,
        },
    });

    const onSubmit = async (values: UserFormValues) => {
        try {
            // Remove password from payload if it's empty during an update
            const payload = { ...values };
            if (initialData && !payload.password) {
                delete payload.password;
            }

            if (initialData?.id) {
                await updateUser(initialData.id, payload as Partial<User>);
                toast.success("تم تحديث بيانات المستخدم بنجاح");
            } else {
                await addUser(payload as User);
                toast.success("تم إضافة المستخدم بنجاح");
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
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>اسم المستخدم</FormLabel>
                            <FormControl>
                                <Input placeholder="أدخل اسم المستخدم" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>البريد الإلكتروني</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="example@domain.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>كلمة المرور {initialData && "(اختياري في حالة التعديل)"}</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>الصلاحية</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الصلاحية" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value={UserRole.ADMIN}>مدير نظام</SelectItem>
                                    <SelectItem value={UserRole.MANAGER}>صلاحيات محدودة</SelectItem>
                                    <SelectItem value={UserRole.STAFF}>موظف</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
