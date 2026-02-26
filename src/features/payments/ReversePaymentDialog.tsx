import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { reversePaymentSchema, ReversePaymentRequest } from "./schema";
import { paymentsService } from "./paymentsService";

interface ReversePaymentDialogProps {
    paymentId: number;
    amount: number;
    onSuccess?: () => void;
}

export function ReversePaymentDialog({ paymentId, amount, onSuccess }: ReversePaymentDialogProps) {
    const [open, setOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const form = useForm<ReversePaymentRequest>({
        resolver: zodResolver(reversePaymentSchema),
        defaultValues: {
            reason: "",
        },
    });

    const onSubmit = async (data: ReversePaymentRequest) => {
        setSuccessMsg("");
        setErrorMsg("");
        try {
            const response = await paymentsService.reverse(paymentId, data);
            if (response.success) {
                setSuccessMsg("تم عكس الدفعة بنجاح");
                setTimeout(() => {
                    setOpen(false);
                    setSuccessMsg("");
                    form.reset();
                    if (onSuccess) onSuccess();
                }, 1500);
            }
        } catch (error: unknown) {
            console.error("Failed to reverse payment", error);
            const err = error as { response?: { data?: { message?: string } } };
            setErrorMsg(err?.response?.data?.message || "حدث خطأ أثناء عكس الدفعة");
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                form.reset();
                setSuccessMsg("");
                setErrorMsg("");
            }
        }}>
            <DialogTrigger asChild>
                <div onClick={(e) => e.stopPropagation()} className="cursor-pointer flex items-center w-full px-2 py-1.5 text-sm hover:bg-slate-100 rounded-sm text-amber-600">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    <span>عكس الدفعة (استرجاع)</span>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>عكس الدفعة</DialogTitle>
                    <DialogDescription className="text-amber-600 font-medium pt-2">
                        سيتم إنشاء دفعة عكسية بقيمة {-amount} جنية. هذه العملية لا يمكن التراجع عنها.
                    </DialogDescription>
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
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>سبب عكس الدفعة</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="أدخل سبب الاسترجاع العكسي..."
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
                            <Button type="submit" disabled={form.formState.isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white">
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                تأكيد العكس
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
