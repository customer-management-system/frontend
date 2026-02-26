import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, DollarSign } from "lucide-react";

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

import { createPaymentSchema, CreatePaymentRequest } from "./schema";
import { PaymentMethod } from "../orders/schema";
import { paymentsService } from "./paymentsService";
import { PaymentInvoice, PaymentData } from "./PaymentInvoice";

interface MakePaymentDialogProps {
    customerId: number;
    onSuccess?: () => void;
}

export function MakePaymentDialog({ customerId, onSuccess }: MakePaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [createdPayment, setCreatedPayment] = useState<PaymentData | null>(null);

    const form = useForm<CreatePaymentRequest>({
        resolver: zodResolver(createPaymentSchema),
        defaultValues: {
            customer_id: customerId,
            amount: 0,
            payment_method: PaymentMethod.CASH,
            reference_number: "",
            notes: "",
        },
    });

    const onSubmit = async (data: CreatePaymentRequest) => {
        setSuccessMsg("");
        setErrorMsg("");
        try {
            const response = await paymentsService.create(data);
            if (response.success) {
                setCreatedPayment(response.data as PaymentData);
            }
        } catch (error: unknown) {
            console.error("Failed to make payment", error);
            const err = error as { response?: { data?: { message?: string } } };
            setErrorMsg(err?.response?.data?.message || "حدث خطأ أثناء تسجيل الدفعة");
        }
    };

    const handlePrint = () => {
        document.body.classList.add('printing-invoice');
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.body.classList.remove('printing-invoice');
            }, 500);
        }, 50);
    };

    const handleReset = () => {
        setCreatedPayment(null);
        form.reset();
        setOpen(false);
        setSuccessMsg("");
        setErrorMsg("");
        if (onSuccess) onSuccess();
    };

    if (createdPayment) {
        return (
            <>
                <Dialog open={open} onOpenChange={(val) => !val && handleReset()}>
                    <DialogContent className="max-w-md print:hidden">
                        <DialogHeader>
                            <DialogTitle className="text-center text-green-600">تم تسجيل الدفعة بنجاح</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="text-center md:space-y-4 space-y-2">
                                <p className="text-lg">رقم الإيصال: <span className="font-bold">{createdPayment.id}</span></p>
                                <p className="text-lg">المبلغ: <span className="font-bold">{createdPayment.amount}</span></p>
                            </div>
                            <div className="flex gap-4 justify-center mt-4">
                                <Button onClick={handlePrint} className="flex-1 gap-2">
                                    طباعة الإيصال
                                </Button>
                                <Button variant="outline" onClick={handleReset} className="flex-1">
                                    إغلاق
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <div className="hidden print:block print-overlay-container bg-white z-[9999]">
                    <PaymentInvoice payment={createdPayment} />
                </div>
            </>
        )
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                handleReset();
            }
        }}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <DollarSign className="h-4 w-4" />
                    تحصيل دفعة
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>تحصيل دفعة جديدة</DialogTitle>
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
                                form.reset();
                            }}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                تسجيل الدفعة
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
