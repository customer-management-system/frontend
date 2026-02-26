import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomersStore } from "./store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, ShoppingCart, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CreateOrderDialog } from "../orders/CreateOrderDialog";
import { Invoice } from "../orders/Invoice";
import { MakePaymentDialog } from "../payments/MakePaymentDialog";
import { UpdatePaymentDialog } from "../payments/UpdatePaymentDialog";
import { ReversePaymentDialog } from "../payments/ReversePaymentDialog";
import { PaymentMethod, OrderData } from "../orders/schema";
import { PaymentInvoice, PaymentData } from "../payments/PaymentInvoice";
import { UpdateOrderDialog } from "../orders/UpdateOrderDialog";
import { ordersService } from "../orders/ordersService";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, RefreshCcw, Calendar as CalendarIcon, Printer } from "lucide-react";
import { paymentsService } from "../payments/paymentsService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/useAuthStore";
import { UserRole } from "@/features/auth/authService";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function CustomerDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {
        currentCustomer,
        financialHistory,
        deletedHistory,
        updateHistory,
        fetchCustomerDetails,
        fetchFinancialHistory,
        fetchDeletedHistory,
        fetchUpdateHistory,
        isLoading
    } = useCustomersStore();
    const { user } = useAuthStore();
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [orderToPrint, setOrderToPrint] = useState<OrderData | null>(null);
    const [isPrintingInfo, setIsPrintingInfo] = useState<number | null>(null);
    const [paymentToPrint, setPaymentToPrint] = useState<PaymentData | null>(null);
    const [isPrintingPayment, setIsPrintingPayment] = useState<number | null>(null);

    const handlePrintOrder = async (orderId: number) => {
        try {
            setIsPrintingInfo(orderId);
            const response = await ordersService.getById(orderId);
            if (response.success) {
                setOrderToPrint(response.data);
                setTimeout(() => {
                    document.body.classList.add('printing-invoice');
                    window.print();
                    setTimeout(() => {
                        document.body.classList.remove('printing-invoice');
                        setOrderToPrint(null);
                        setIsPrintingInfo(null);
                    }, 500);
                }, 100);
            }
        } catch (e) {
            console.error(e);
            setIsPrintingInfo(null);
        }
    };

    const handlePrintPayment = async (paymentId: number) => {
        try {
            setIsPrintingPayment(paymentId);
            const response = await paymentsService.getById(paymentId);
            if (response.success) {
                setPaymentToPrint(response.data);
                setTimeout(() => {
                    document.body.classList.add('printing-invoice');
                    window.print();
                    setTimeout(() => {
                        document.body.classList.remove('printing-invoice');
                        setPaymentToPrint(null);
                        setIsPrintingPayment(null);
                    }, 500);
                }, 100);
            }
        } catch (e) {
            console.error(e);
            setIsPrintingPayment(null);
        }
    };

    console.log({ currentCustomer });

    useEffect(() => {
        if (id) {
            const customerId = parseInt(id);
            fetchCustomerDetails(customerId);
            fetchFinancialHistory(customerId);
            fetchDeletedHistory(customerId);
            fetchUpdateHistory(customerId);
        }
    }, [id, fetchCustomerDetails, fetchFinancialHistory, fetchDeletedHistory, fetchUpdateHistory]);

    const handleFilter = () => {
        if (id) {
            fetchFinancialHistory(
                parseInt(id),
                dateRange?.from?.toISOString(),
                dateRange?.to?.toISOString()
            );
        }
    };

    const handleResetFilter = () => {
        setDateRange(undefined);
        if (id) {
            fetchFinancialHistory(parseInt(id)); // Reset filter
        }
    };

    if (isLoading && !currentCustomer) {
        return <div className="p-8 text-center">جاري التحميل...</div>;
    }

    if (!currentCustomer) {
        return <div className="p-8 text-center text-red-500">العميل غير موجود</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="gap-2" onClick={() => navigate('/customers')}>
                    <ArrowRight className="h-4 w-4" />
                    عودة
                </Button>
                <h1 className="text-2xl font-bold">{currentCustomer.name}</h1>
                <div className="mr-auto flex gap-2">
                    <MakePaymentDialog
                        customerId={parseInt(id!)}
                        onSuccess={() => {
                            // Refresh data
                            if (id) {
                                const customerId = parseInt(id);
                                fetchCustomerDetails(customerId);
                                fetchFinancialHistory(customerId);
                            }
                        }}
                    />
                    <CreateOrderDialog
                        customerId={parseInt(id!)}
                        onSuccess={() => {
                            // Refresh data
                            if (id) {
                                const customerId = parseInt(id);
                                fetchCustomerDetails(customerId);
                                fetchFinancialHistory(customerId);
                            }
                        }}
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{financialHistory?.summary.totalOrders || 0} جنية</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">المدفوعات</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{financialHistory?.summary.totalPaid || 0} جنية</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الدين</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{financialHistory?.summary.currentBalance || 0} جنية</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">معلومات الاتصال</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-muted-foreground">
                            <div>{currentCustomer.phone}</div>
                            {currentCustomer.address && <div>{currentCustomer.address}</div>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="active" className="w-full" dir="rtl">
                <div className="flex justify-start mb-4">
                    <TabsList>
                        <TabsTrigger value="active" className="text-base px-8 py-2">نشط</TabsTrigger>
                        {user?.role === UserRole.ADMIN && (
                            <>
                                <TabsTrigger value="deleted" className="text-base px-8 py-2">محذوف</TabsTrigger>
                                <TabsTrigger value="updated" className="text-base px-8 py-2">تم تعديله</TabsTrigger>
                            </>
                        )}
                    </TabsList>
                </div>

                <TabsContent value="active" className="m-0 focus-visible:outline-none">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>السجل المالي</CardTitle>
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-[300px] justify-start text-right font-normal",
                                                !dateRange && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, "dd/MM/yyyy", { locale: ar })} -{" "}
                                                        {format(dateRange.to, "dd/MM/yyyy", { locale: ar })}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "dd/MM/yyyy", { locale: ar })
                                                )
                                            ) : (
                                                <span>اختر فترة زمنية</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange}
                                            onSelect={setDateRange}
                                            numberOfMonths={2}
                                            locale={ar}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Button onClick={handleFilter} variant="default">تطبيق</Button>
                                {dateRange && (
                                    <Button onClick={handleResetFilter} variant="ghost" className="text-red-500">
                                        إلغاء الفلتر
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-right">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">التاريخ</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">النوع</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">الوصف</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">التفاصيل</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">المبلغ</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">الرصيد</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {financialHistory?.history.map((record) => (
                                            <tr key={record.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    {format(new Date(record.date), 'dd/MM/yyyy HH:mm', { locale: ar })}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${record.status === 'deleted' ? 'bg-red-100 text-red-800' :
                                                        record.status === 'reversed' ? 'bg-amber-100 text-amber-800' :
                                                            record.type === 'PAYMENT' ? 'bg-green-100 text-green-800' :
                                                                record.type === 'ORDER' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {record.status === 'deleted' ? 'محذوف' :
                                                            record.status === 'reversed' ? 'مسترجع (معكوس)' :
                                                                record.type === 'PAYMENT' ? 'دفعة' :
                                                                    record.type === 'ORDER' ? 'طلب' : record.type}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div>{record.description}</div>
                                                    {record.type === 'PAYMENT' && record.method && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            طريقة الدفع: {record.method}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <td className="p-4 align-middle">
                                                        {record.type === 'ORDER' && record.quantity && (
                                                            <div className="text-xs font-semibold mb-1">
                                                                العدد الكلي: {record.quantity}
                                                            </div>
                                                        )}
                                                        {record.items && (
                                                            <div className="space-y-1">
                                                                <ul className="list-disc list-inside text-xs text-muted-foreground">
                                                                    {record.items.map((item, idx) => (
                                                                        <li key={idx}>
                                                                            {item.productName} ({item.quantity} x {item.unitPrice})
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                                {record.type === 'ORDER' && (record.discountAmount || 0) > 0 && (
                                                                    <div className="text-xs text-green-600 mt-1">
                                                                        خصم: {record.discountAmount} ({record.discountType === 'percentage' ? 'نسبة' : 'مبلغ ثابت'})
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </td>
                                                <td className={`p-4 align-middle font-medium ${record.status === 'deleted' || record.status === 'reversed' ? 'text-gray-400 line-through' :
                                                    record.type === 'PAYMENT' ? 'text-green-600' : 'text-blue-600'
                                                    }`}>
                                                    {record.amount}
                                                </td>
                                                <td className="p-4 align-middle text-left font-mono">{record.runningBalance}</td>
                                                <td className="p-4 align-middle text-center">
                                                    {(record.type === 'PAYMENT' || record.type === 'ORDER') && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">فتح القائمة</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {record.type === 'PAYMENT' && record.status !== 'deleted' && record.status !== 'reversed' && (
                                                                    <>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handlePrintPayment(record.referenceId)}
                                                                            disabled={isPrintingPayment === record.referenceId}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <Printer className="mr-2 h-4 w-4" />
                                                                            <span>{isPrintingPayment === record.referenceId ? "جاري التجهيز..." : "طباعة الإيصال"}</span>
                                                                        </DropdownMenuItem>
                                                                        <UpdatePaymentDialog
                                                                            paymentId={record.referenceId}
                                                                            initialData={{
                                                                                amount: record.amount,
                                                                                payment_method: (record.method?.toUpperCase() as PaymentMethod) || PaymentMethod.CASH,
                                                                                reference_number: "", // Assuming not returned directly in history without a fetch
                                                                                notes: record.description
                                                                            }}
                                                                            onSuccess={() => {
                                                                                if (id) {
                                                                                    fetchCustomerDetails(parseInt(id));
                                                                                    fetchFinancialHistory(parseInt(id));
                                                                                    fetchDeletedHistory(parseInt(id));
                                                                                }
                                                                            }}
                                                                        />
                                                                        <ReversePaymentDialog
                                                                            paymentId={record.referenceId}
                                                                            amount={record.amount}
                                                                            onSuccess={() => {
                                                                                if (id) {
                                                                                    fetchCustomerDetails(parseInt(id));
                                                                                    fetchFinancialHistory(parseInt(id));
                                                                                    fetchDeletedHistory(parseInt(id));
                                                                                }
                                                                            }}
                                                                        />
                                                                        <DropdownMenuItem
                                                                            className="text-red-600 focus:text-red-600 cursor-pointer"
                                                                            onClick={async () => {
                                                                                if (confirm('هل أنت متأكد من حذف هذه الدفعة نهائياً؟')) {
                                                                                    try {
                                                                                        await paymentsService.delete(record.referenceId);
                                                                                        if (id) {
                                                                                            fetchCustomerDetails(parseInt(id));
                                                                                            fetchFinancialHistory(parseInt(id));
                                                                                            fetchDeletedHistory(parseInt(id));
                                                                                        }
                                                                                    } catch (e) {
                                                                                        console.error('Failed to delete', e);
                                                                                        alert('حدث خطأ أثناء الحذف');
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash className="mr-2 h-4 w-4" />
                                                                            <span>حذف الدفعة</span>
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                {record.type === 'PAYMENT' && record.status === 'deleted' && (
                                                                    <DropdownMenuItem
                                                                        className="text-green-600 focus:text-green-600 cursor-pointer"
                                                                        onClick={async () => {
                                                                            if (confirm('هل أنت متأكد من استعادة هذه الدفعة؟')) {
                                                                                try {
                                                                                    await paymentsService.restore(record.referenceId);
                                                                                    if (id) {
                                                                                        fetchCustomerDetails(parseInt(id));
                                                                                        fetchFinancialHistory(parseInt(id));
                                                                                        fetchDeletedHistory(parseInt(id));
                                                                                    }
                                                                                } catch (e) {
                                                                                    console.error('Failed to restore', e);
                                                                                    alert('حدث خطأ أثناء الاستعادة');
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                                                        <span>استعادة الدفعة</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {record.type === 'ORDER' && record.status !== 'deleted' && record.status !== 'reversed' && (
                                                                    <>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handlePrintOrder(record.referenceId)}
                                                                            disabled={isPrintingInfo === record.referenceId}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <Printer className="mr-2 h-4 w-4" />
                                                                            <span>{isPrintingInfo === record.referenceId ? "جاري التجهيز..." : "طباعة الفاتورة"}</span>
                                                                        </DropdownMenuItem>
                                                                        <UpdateOrderDialog
                                                                            orderId={record.referenceId}
                                                                            onSuccess={() => {
                                                                                if (id) {
                                                                                    fetchCustomerDetails(parseInt(id));
                                                                                    fetchFinancialHistory(parseInt(id));
                                                                                    fetchDeletedHistory(parseInt(id));
                                                                                }
                                                                            }}
                                                                        />
                                                                        <DropdownMenuItem
                                                                            className="text-red-600 focus:text-red-600 cursor-pointer"
                                                                            onClick={async () => {
                                                                                if (confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
                                                                                    try {
                                                                                        await ordersService.delete(record.referenceId);
                                                                                        if (id) {
                                                                                            fetchCustomerDetails(parseInt(id));
                                                                                            fetchFinancialHistory(parseInt(id));
                                                                                            fetchDeletedHistory(parseInt(id));
                                                                                        }
                                                                                    } catch (e) {
                                                                                        console.error('Failed to delete', e);
                                                                                        alert('حدث خطأ أثناء الحذف');
                                                                                    }
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Trash className="mr-2 h-4 w-4" />
                                                                            <span>حذف الطلب</span>
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                                {record.type === 'ORDER' && record.status === 'deleted' && (
                                                                    <DropdownMenuItem
                                                                        className="text-green-600 focus:text-green-600 cursor-pointer"
                                                                        onClick={async () => {
                                                                            if (confirm('هل أنت متأكد من استعادة هذا الطلب؟')) {
                                                                                try {
                                                                                    await ordersService.restore(record.referenceId);
                                                                                    if (id) {
                                                                                        fetchCustomerDetails(parseInt(id));
                                                                                        fetchFinancialHistory(parseInt(id));
                                                                                        fetchDeletedHistory(parseInt(id));
                                                                                    }
                                                                                } catch (e) {
                                                                                    console.error('Failed to restore', e);
                                                                                    alert('حدث خطأ أثناء الاستعادة');
                                                                                }
                                                                            }
                                                                        }}
                                                                    >
                                                                        <RefreshCcw className="mr-2 h-4 w-4" />
                                                                        <span>استعادة الطلب</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!financialHistory?.history || financialHistory?.history.length === 0) && (
                                            <tr>
                                                <td colSpan={7} className="p-4 text-center text-muted-foreground">
                                                    لا توجد سجلات مالية
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {user?.role === UserRole.ADMIN && (
                    <TabsContent value="deleted" className="m-0 focus-visible:outline-none">
                        <Card>
                            <CardHeader>
                                <CardTitle>السجل المالي المحذوف</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm text-right">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">تاريخ الحذف</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">النوع</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">الوصف</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">المبلغ</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">بواسطة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {deletedHistory?.history.map((record) => (
                                                <tr key={record.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle">
                                                        {format(new Date(record.deleted_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                                                    </td>
                                                    <td className="p-4 align-middle whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {record.type === 'PAYMENT' ? (
                                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">دفعة</span>
                                                            ) : record.type === 'ORDER' ? (
                                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">طلب</span>
                                                            ) : (
                                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{record.type}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">{record.description}</td>
                                                    <td className="p-4 align-middle font-bold text-red-600">
                                                        {record.amount} جنية
                                                    </td>
                                                    <td className="p-4 align-middle font-medium">
                                                        {record.deleted_by?.username || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!deletedHistory?.history || deletedHistory?.history.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                        لا توجد سجلات محذوفة
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {user?.role === UserRole.ADMIN && (
                    <TabsContent value="updated" className="m-0 focus-visible:outline-none">
                        <Card>
                            <CardHeader>
                                <CardTitle>سجل التعديلات</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative w-full overflow-auto">
                                    <table className="w-full caption-bottom text-sm text-right">
                                        <thead className="[&_tr]:border-b">
                                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">تاريخ التعديل</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">النوع</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">الوصف</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">التغييرات</th>
                                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">بواسطة</th>
                                            </tr>
                                        </thead>
                                        <tbody className="[&_tr:last-child]:border-0">
                                            {updateHistory?.history.map((record) => (
                                                <tr key={record.id} className="border-b transition-colors hover:bg-muted/50">
                                                    <td className="p-4 align-middle">
                                                        {format(new Date(record.updated_at), 'dd/MM/yyyy HH:mm', { locale: ar })}
                                                    </td>
                                                    <td className="p-4 align-middle whitespace-nowrap">
                                                        {record.type === 'PAYMENT' ? (
                                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">دفعة</span>
                                                        ) : record.type === 'ORDER' ? (
                                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">طلب</span>
                                                        ) : (
                                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{record.type}</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 align-middle">{record.description}</td>
                                                    <td className="p-4 align-middle text-xs">
                                                        {record.type === 'ORDER' && record.changes?.items ? (
                                                            <div className="space-y-1">
                                                                {record.changes.items.map((item: any, idx: number) => (
                                                                    <div key={idx} className="bg-muted/50 rounded px-2 py-1">
                                                                        الكمية: {item.quantity} | السعر: {item.unitPrice}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : record.type === 'PAYMENT' ? (
                                                            <div className="space-y-1">
                                                                {record.changes?.amount && (
                                                                    <div className="bg-muted/50 rounded px-2 py-1">
                                                                        المبلغ: {record.changes.amount.old} → {record.changes.amount.new}
                                                                    </div>
                                                                )}
                                                                {record.changes?.method && record.changes.method.old !== record.changes.method.new && (
                                                                    <div className="bg-muted/50 rounded px-2 py-1">
                                                                        الطريقة: {record.changes.method.old} → {record.changes.method.new}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 align-middle font-medium">
                                                        {record.updated_by?.username || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!updateHistory?.history || updateHistory?.history.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                                        لا توجد سجلات تعديل
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>

            {orderToPrint && currentCustomer && (
                <div className="hidden print:block print-overlay-container bg-white z-[9999]" dir="rtl">
                    <Invoice
                        order={orderToPrint}
                        previousBalance={0}
                        customerName={currentCustomer.name}
                        customerPhone={currentCustomer.phone}
                    />
                </div>
            )}

            {paymentToPrint && (
                <div className="hidden print:block print-overlay-container bg-white z-[9999]">
                    <PaymentInvoice payment={paymentToPrint} />
                </div>
            )}
        </div>
    );
}
