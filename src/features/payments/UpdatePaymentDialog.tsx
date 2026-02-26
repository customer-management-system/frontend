import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { updatePaymentSchema, UpdatePaymentRequest } from "./schema";
import { PaymentMethod } from "../orders/schema";
import { paymentsService } from "./paymentsService";

interface UpdatePaymentDialogProps {
    paymentId: number;
    initialData: {
        amount: number;
        payment_method: PaymentMethod;
        reference_number?: string;
        notes?: string;
    };
    onSuccess?: () => void;
}

export function UpdatePaymentDialog({ paymentId, initialData, onSuccess }: UpdatePaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const form = useForm<UpdatePaymentRequest>({
        resolver: zodResolver(updatePaymentSchema),
        defaultValues: {
            amount: initialData.amount,
            payment_method: initialData.payment_method,
            reference_number: initialData.reference_number || "",
            notes: initialData.notes || "",
        },
    });

    const onSubmit = async (data: UpdatePaymentRequest) => {
        setSuccessMsg("");
        setErrorMsg("");
        try {
            const response = await paymentsService.update(paymentId, data);
            if (response.success) {
                setSuccessMsg("تم تعديل الدفعة بنجاح");
                setTimeout(() => {
                    setOpen(false);
                    setSuccessMsg("");
                    form.reset(data); // Set the new data as the form's default
                    if (onSuccess) onSuccess();
                }, 1500);
            }
        } catch (error: unknown) {
            console.error("Failed to update payment", error);
            const err = error as { response?: { data?: { message?: string } } };
            setErrorMsg(err?.response?.data?.message || "حدث خطأ أثناء تعديل الدفعة");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                form.reset(initialData); // Reset to original data if closed without saving
                setSuccessMsg("");
                setErrorMsg("");
            }
        }}>
            <DialogTrigger asChild>
                <div onClick={(e) => e.stopPropagation()} className="cursor-pointer flex items-center w-full px-2 py-1.5 text-sm hover:bg-slate-100 rounded-sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    <span>تعديل</span>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>تعديل بيانات الدفعة</DialogTitle>
                </DialogHeader>

                {successMsg && (
                    <div className="bg-green-100 text-green-800 p-3 rounded-md text-sm text-center">
                        {successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="bg-red-100 text-red-800 p-3 rounded-md text-sm text-center">
                        {errorMsg}
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>المبلغ</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="أدخل المبلغ..."
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="payment_method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>طريقة الدفع</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر طريقة الدفع" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.values(PaymentMethod).map(method => (
                                                <SelectItem key={method} value={method}>
                                                    {method === 'CASH' ? 'كاش' :
                                                        method === 'INSTAPAY' ? 'انستاباي' :
                                                            method === 'VODAFONE_CASH' ? 'فودافون كاش' :
                                                                method === 'BANK_TRANSFER' ? 'تحويل بنكي' :
                                                                    method === 'CHEQUE' ? 'شيك' : method}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reference_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>رقم المرجع (اختياري)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="أدخل رقم المرجع إن وجد" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ملاحظات (اختياري)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="أدخل أي ملاحظات إضافية"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                setOpen(false);
                                form.reset(initialData);
                            }}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                حفظ التعديلات
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
