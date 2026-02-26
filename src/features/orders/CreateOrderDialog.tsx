import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Trash, Search, Loader2 } from "lucide-react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { createOrderSchema, PaymentMethod, DiscountType, Product, CreateOrderRequest, OrderData } from "./schema";
import { ordersService } from "./ordersService";
import { customersService } from "../customers/customersService";
import { PricingHistoryItem } from "../customers/schema";
import { Invoice } from "./Invoice";

interface CreateOrderDialogProps {
    customerId: number;
    onSuccess?: () => void;
}

export function CreateOrderDialog({ customerId, onSuccess }: CreateOrderDialogProps) {
    const [open, setOpen] = useState(false);
    const [productOpen, setProductOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [pricingHistory, setPricingHistory] = useState<PricingHistoryItem[]>([]);

    const form = useForm<CreateOrderRequest>({
        resolver: zodResolver(createOrderSchema),
        defaultValues: {
            customer_id: customerId,
            items: [],
            discount_amount: 0,
            discount_type: DiscountType.FIXED,
            payment: {
                amount: 0,
                method: PaymentMethod.CASH,
                notes: "",
            },
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    // Fetch products on search
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

    // Fetch pricing history
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

    // Calculate totals
    const items = form.watch("items");
    const orderDiscountAmount = form.watch("discount_amount") || 0;
    const orderDiscountType = form.watch("discount_type");

    const subtotal = items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unit_price;
        // Item level discount logic if needed, currently optional in schema but simplified here
        return sum + itemTotal;
    }, 0);

    const calculateTotal = () => {
        let total = subtotal;
        if (orderDiscountType === DiscountType.FIXED) {
            total -= orderDiscountAmount;
        } else if (orderDiscountType === DiscountType.PERCENTAGE) {
            total -= (subtotal * orderDiscountAmount) / 100;
        }
        return Math.max(0, total);
    };

    const total = calculateTotal();

    // Auto-update payment amount when total changes
    useEffect(() => {
        form.setValue("payment.amount", total);
    }, [total, form, form.setValue]);


    const [createdOrder, setCreatedOrder] = useState<OrderData | null>(null);
    const [previousBalance, setPreviousBalance] = useState(0);
    const [currentCustomer, setCurrentCustomer] = useState<{ name: string, phone: string } | null>(null);

    const onSubmit = async (data: CreateOrderRequest) => {
        try {
            // 1. Fetch current customer details for previous balance
            const customerResponse = await customersService.getById(customerId);
            if (customerResponse) { // Assuming getById returns the customer object directly or we adjust
                // The service actually returns Customer object directly based on previous view_file
                setPreviousBalance(customerResponse.outstanding_balance || 0);
                setCurrentCustomer({
                    name: customerResponse.name,
                    phone: customerResponse.phone
                });
            }

            // 2. Create Order
            const response = await ordersService.create(data);
            if (response.success) {
                setCreatedOrder(response.data);
                // Don't close immediately, show success view
            }
        } catch (error) {
            console.error("Failed to create order", error);
        }
    };

    const handleAddProduct = (product: Product | PricingHistoryItem, priceOverride?: number) => {
        // If it's a Product (has default_price), use logic to find history price if not overridden
        let unitPrice = priceOverride;

        if (unitPrice === undefined) {
            if ('default_price' in product) {
                const historyItem = pricingHistory.find(item => item.product_id === product.id);
                unitPrice = historyItem ? historyItem.last_price : product.default_price;
            } else {
                // It's a PricingHistoryItem, use its last_price
                unitPrice = product.last_price;
            }
        }

        const productId = 'id' in product ? product.id : product.product_id;
        const productName = 'name' in product ? product.name : product.product_name;

        append({
            product_id: productId,
            product_name: productName,
            quantity: 1,
            unit_price: unitPrice,
        });
        setProductOpen(false);
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
        setCreatedOrder(null);
        setPreviousBalance(0);
        form.reset();
        setOpen(false);
        if (onSuccess) onSuccess(); // Trigger refresh on data
    };

    // If order is created, showing specific dialog content
    if (createdOrder && currentCustomer) {
        return (
            <>
                <Dialog open={open} onOpenChange={(val) => !val && handleReset()}>
                    <DialogContent className="max-w-md print:hidden">
                        <DialogHeader>
                            <DialogTitle className="text-center text-green-600">تم إنشاء الطلب بنجاح</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="text-center space-y-2">
                                <p>رقم الفاتورة: <span className="font-bold">{createdOrder.invoice?.number}</span></p>
                                <p>الإجمالي: <span className="font-bold">{createdOrder.total_amount}</span></p>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <Button onClick={handlePrint} className="flex-1 gap-2">
                                    طباعة الفاتورة
                                </Button>
                                <Button variant="outline" onClick={handleReset} className="flex-1">
                                    إغلاق
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Hidden Invoice Component that shows up on print */}
                <div className="hidden print:block print-overlay-container bg-white z-[9999]">
                    <Invoice
                        order={createdOrder}
                        previousBalance={previousBalance}
                        customerName={currentCustomer.name}
                        customerPhone={currentCustomer.phone}
                    />
                </div>
            </>
        )
    }

    // Normal Form Render
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>إنشاء طلب جديد</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:hidden">
                <DialogHeader>
                    <DialogTitle>إنشاء طلب جديد</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* ... (rest of the form content is unchanged) ... */}
                        {/* Recent Purchases */}
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

                        {/* Product Search & Add */}
                        <div className="flex flex-col gap-2">
                            <FormLabel>إضافة منتجات</FormLabel>
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
                                                {isSearching ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "لا يوجد منتجات."}
                                            </CommandEmpty>
                                            <CommandGroup>
                                                {products.map((product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        value={product.name}
                                                        onSelect={() => handleAddProduct(product)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4 opacity-0"
                                                            )}
                                                        />
                                                        {product.name} ({product.default_price} جنية)
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Items List */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-sm">المنتجات المختارة</h3>
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
                                                        {...field}
                                                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
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
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
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

                        {/* Order Summary & Discount */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
                            <div className="space-y-4">
                                <h3 className="font-semibold">الخصم والدفع</h3>
                                <div className="flex gap-4">
                                    <FormField
                                        control={form.control}
                                        name="discount_amount"
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel>قيمة الخصم</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="discount_type"
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                <FormLabel>نوع الخصم</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="النوع" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={DiscountType.FIXED}>مبلغ</SelectItem>
                                                        <SelectItem value={DiscountType.PERCENTAGE}>نسبة</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <FormLabel>تفاصيل الدفع</FormLabel>
                                    <FormField
                                        control={form.control}
                                        name="payment.method"
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="طريقة الدفع" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.values(PaymentMethod).map(method => (
                                                            <SelectItem key={method} value={method}>{method}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="payment.amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="المبلغ المدفوع"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>المجموع الفرعي:</span>
                                    <span>{subtotal.toFixed(2)} جنية</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>الخصم:</span>
                                    <span>
                                        {orderDiscountType === DiscountType.FIXED
                                            ? `${orderDiscountAmount} جنية`
                                            : `${orderDiscountAmount}%`}
                                    </span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>الإجمالي:</span>
                                    <span>{total.toFixed(2)} جنية</span>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                حفظ الطلب
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
