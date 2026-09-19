import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Trash, Search, Loader2, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { createReturnSchema, CreateReturnRequest, ReturnData, ReturnItemRequest } from "./schema";
import { numberInputValue, parseOptionalFloat } from "@/lib/formNumberInput";
import { returnsService } from "./returnsService";
import { ordersService } from "../orders/ordersService";
import { customersService } from "../customers/customersService";
import { PricingHistoryItem } from "../customers/schema";
import { Product } from "../orders/schema";
import { toast } from "react-toastify";
import { ReturnSlip } from "./ReturnSlip";
import { PrintOverlay } from "@/components/shared/PrintOverlay";
import { triggerPrint } from "@/lib/printManager";
import { getApiErrorMessage } from "@/lib/getErrorMessage";

interface ReturnDialogProps {
    customerId: number;
    onSuccess?: () => void;
}

export function ReturnDialog({ customerId, onSuccess }: ReturnDialogProps) {
    const [open, setOpen] = useState(false);
    const [productOpen, setProductOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [pricingHistory, setPricingHistory] = useState<PricingHistoryItem[]>([]);
    const [createdReturn, setCreatedReturn] = useState<ReturnData | null>(null);
    const [customerName, setCustomerName] = useState("");

    const form = useForm<CreateReturnRequest>({
        resolver: zodResolver(createReturnSchema),
        defaultValues: {
            customer_id: customerId,
            items: [],
            notes: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    useEffect(() => {
        const fetchProducts = async () => {
            setIsSearching(true);
            try {
                const response = await ordersService.getProducts(1, 20, searchQuery);
                if (response.success) {
                    setProducts(response.data.products);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (!customerId || !open) return;

        const fetchPricingHistory = async () => {
            try {
                const history = await customersService.getPricingHistory(customerId);
                if (history.success) {
                    setPricingHistory(history.data);
                }
            } catch (error) {
                console.error("Failed to fetch pricing history", error);
            }
        };

        fetchPricingHistory();
    }, [customerId, open]);

    const items = form.watch("items");
    const total = items.reduce((sum, item) => sum + (item.quantity ?? 0) * (item.unit_price ?? 0), 0);

    const handleAddProduct = (product: Product | PricingHistoryItem, priceOverride?: number) => {
        let unitPrice = priceOverride;

        if (unitPrice === undefined) {
            if ('default_price' in product) {
                const historyItem = pricingHistory.find((item) => item.product_id === product.id);
                unitPrice = historyItem ? historyItem.last_price : product.default_price;
            } else {
                unitPrice = product.last_price;
            }
        }

        const productId = 'id' in product ? product.id : product.product_id;
        const productName = 'name' in product ? product.name : product.product_name;

        append({
            product_id: productId,
            product_name: productName,
            unit_price: unitPrice,
        } as ReturnItemRequest);
        setProductOpen(false);
    };

    const onSubmit = async (data: CreateReturnRequest) => {
        try {
            const customerResponse = await customersService.getById(customerId);
            setCustomerName(customerResponse?.name ?? "العميل");

            const response = await returnsService.create(data);
            if (response.success) {
                setCreatedReturn(response.data);
            }
        } catch (error: unknown) {
            toast.error(getApiErrorMessage(error, 'فشل تسجيل المرتجع'));
        }
    };

    const handlePrint = () => {
        triggerPrint({ printClass: 'printing-invoice' });
    };

    const handleReset = () => {
        setCreatedReturn(null);
        form.reset({
            customer_id: customerId,
            items: [],
            notes: "",
        });
        setOpen(false);
        if (onSuccess) onSuccess();
    };

    const showSuccess = Boolean(createdReturn && customerName);

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(val) => {
                    if (!val) {
                        if (showSuccess) {
                            handleReset();
                        } else {
                            setOpen(false);
                        }
                    } else {
                        setOpen(true);
                    }
                }}
            >
                {!showSuccess && (
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                            <RotateCcw className="h-4 w-4" />
                            مرتجع
                        </Button>
                    </DialogTrigger>
                )}
                <DialogContent className={showSuccess ? "max-w-md print:hidden" : "max-w-4xl max-h-[90vh] overflow-y-auto print:hidden"}>
                    {showSuccess && createdReturn ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-center text-green-600">تم تسجيل المرتجع بنجاح</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col gap-4 py-4">
                                <div className="text-center space-y-2">
                                    <p>رقم المرتجع: <span className="font-bold">{createdReturn.id}</span></p>
                                    <p>قيمة المرتجع: <span className="font-bold">{createdReturn.total_amount}</span></p>
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <Button onClick={handlePrint} className="flex-1 gap-2">
                                        طباعة إشعار المرتجع
                                    </Button>
                                    <Button variant="outline" onClick={handleReset} className="flex-1">
                                        إغلاق
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>تسجيل مرتجع (مرتجع)</DialogTitle>
                            </DialogHeader>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    {pricingHistory.length > 0 && (
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">اخر المشتريات</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {pricingHistory.map((item) => (
                                                    <div
                                                        key={`${item.product_id}-${item.last_sold_at}`}
                                                        className="border rounded-md p-3 cursor-pointer hover:bg-muted/50 transition-colors flex flex-col gap-1"
                                                        onClick={() => handleAddProduct(item)}
                                                    >
                                                        <span className="font-semibold text-sm">{item.product_name}</span>
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>{item.last_price} جنية</span>
                                                            <span>{new Date(item.last_sold_at).toLocaleDateString('ar-EG')}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <FormLabel>إضافة منتجات مرتجعة</FormLabel>
                                        <Popover open={productOpen} onOpenChange={setProductOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={productOpen}
                                                    className="justify-between"
                                                >
                                                    بحث عن منتج...
                                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command shouldFilter={false}>
                                                    <CommandInput
                                                        placeholder="ابحث باسم المنتج..."
                                                        onValueChange={setSearchQuery}
                                                        value={searchQuery}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            {isSearching ? (
                                                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                                            ) : (
                                                                "لا يوجد منتجات."
                                                            )}
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {products.map((product) => (
                                                                <CommandItem
                                                                    key={product.id}
                                                                    value={product.name}
                                                                    onSelect={() => handleAddProduct(product)}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                                                                    {product.name} ({product.default_price} جنية)
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm">المنتجات المرتجعة</h3>
                                        {fields.length === 0 && (
                                            <div className="text-muted-foreground text-sm text-center py-4 border border-dashed rounded-md">
                                                لم يتم اختيار أي منتجات
                                            </div>
                                        )}

                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex gap-4 items-end border p-3 rounded-md bg-muted/20">
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium">{field.product_name}</span>
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-24">
                                                            <FormLabel className="text-xs">الكمية</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0.01"
                                                                    placeholder="الكمية"
                                                                    value={numberInputValue(field.value)}
                                                                    onChange={(e) => field.onChange(parseOptionalFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.unit_price`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-32">
                                                            <FormLabel className="text-xs">السعر</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="السعر"
                                                                    value={numberInputValue(field.value)}
                                                                    onChange={(e) => field.onChange(parseOptionalFloat(e.target.value))}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 mb-1"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {form.formState.errors.items && (
                                            <FormMessage>{form.formState.errors.items.message}</FormMessage>
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="notes"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ملاحظات (اختياري)</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="ملاحظات عن المرتجع..." />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                        <span>إجمالي المرتجع:</span>
                                        <span>{total.toFixed(2)} جنية</span>
                                    </div>

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                            إلغاء
                                        </Button>
                                        <Button type="submit" disabled={form.formState.isSubmitting || fields.length === 0}>
                                            {form.formState.isSubmitting ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            تأكيد المرتجع
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {showSuccess && createdReturn && (
                <PrintOverlay>
                    <ReturnSlip returnRecord={createdReturn} customerName={customerName} />
                </PrintOverlay>
            )}
        </>
    );
}
