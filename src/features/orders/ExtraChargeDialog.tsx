import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ordersService } from "./ordersService";
import { FilePlus, Loader2 } from "lucide-react";

interface ExtraChargeDialogProps {
    customerId: number;
    onSuccess?: () => void;
}

export function ExtraChargeDialog({ customerId, onSuccess }: ExtraChargeDialogProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError("برجاء إدخال مبلغ صحيح أكبر من الصفر");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            await ordersService.extraCharge({
                customer_id: customerId,
                amount: numAmount
            });

            setOpen(false);
            setAmount("");
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            console.error("Failed to add extra charge:", err);
            setError(err.response?.data?.message || err.message || "حدث خطأ أثناء الإضافة. حاول مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setAmount("");
                setError(null);
            }
        }}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-orange-600 hover:bg-orange-700 text-white">
                    <FilePlus className="h-4 w-4" />
                    إشعار إضافة
                </Button>
            </DialogTrigger>
            <DialogContent dir="rtl" className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>إضافة إشعار (Extra Charge)</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">المبلغ</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading || !amount}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                جاري الإضافة...
                            </>
                        ) : (
                            "تأكيد وإضافة"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
