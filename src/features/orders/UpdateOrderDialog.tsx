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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { updateOrderSchema, UpdateOrderRequest, Product } from "./schema";
import { ordersService } from "./ordersService";

interface UpdateOrderDialogProps {
    orderId: number;
    onSuccess?: () => void;
}

export function UpdateOrderDialog({ orderId, onSuccess }: UpdateOrderDialogProps) {
    const [open, setOpen] = useState(false);
    const [productOpen, setProductOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UpdateOrderRequest>({
        resolver: zodResolver(updateOrderSchema),
        defaultValues: {
            items: [],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "items",
    });

    // Fetch order details when dialog opens
    useEffect(() => {
        if (!open) return;

        const fetchOrder = async () => {
            setIsLoading(true);
            try {
                const response = await ordersService.getById(orderId);
                if (response.success && response.data) {
                    const existingItems = response.data.items.map((item: any) => ({
                        id: item.id,
                        product_id: item.product?.id,
                        product_name: item.product?.name || 'منتج',
                        quantity: item.quantity,
                        unit_price: item.unitPrice || item.unit_price, // handle camelCase or snake_case depends on API output
                    }));
                    replace(existingItems);
                }
            } catch (error) {
                console.error("Failed to fetch order", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [open, orderId, replace]);

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

    const onSubmit = async (data: UpdateOrderRequest) => {
        try {
            // Ensure data is formatted exactly as needed
            const payload = {
                items: data.items.map(item => ({
                    id: item.id, // Will be undefined for new items
                    product_id: item.id ? undefined : item.product_id, // Only send product_id for new items if applicable
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                }))
            };

            const response = await ordersService.update(orderId, payload);
            if (response.success) {
                setOpen(false);
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error("Failed to update order", error);
            alert("حدث خطأ أثناء تعديل الطلب");
        }
    };

    const handleAddProduct = (product: Product) => {
        append({
            product_id: product.id,
            // @ts-ignore
            product_name: product.name,
            quantity: 1,
            unit_price: product.default_price,
        });
        setProductOpen(false);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset();
        }
        setOpen(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault();
                        setOpen(true);
                    }}
                    className="cursor-pointer"
                >
                    تعديل الطلب
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>تعديل الطلب #{orderId}</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                            {/* @ts-ignore */}
                                            <span className="text-sm font-medium">{field.product_name || "منتج"}</span>
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

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    حفظ التعديلات
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
