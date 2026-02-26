import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
    Activity,
    AlertTriangle,
    CreditCard,
    DollarSign,
    Package,
    TrendingDown,
    TrendingUp,
    Users,
    CalendarIcon
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { dashboardService, KPIsResponse, CashFlowResponse, AlertsResponse, CustomersDebtResponse, TopProductsResponse } from './dashboardService';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const [kpis, setKpis] = useState<KPIsResponse['data'] | null>(null);
    const [cashFlow, setCashFlow] = useState<CashFlowResponse['data'] | null>(null);
    const [alerts, setAlerts] = useState<AlertsResponse['data'] | null>(null);
    const [debtors, setDebtors] = useState<CustomersDebtResponse['data'] | null>(null);
    const [topProducts, setTopProducts] = useState<TopProductsResponse['data'] | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const startDate = dateRange?.from?.toISOString();
            const endDate = dateRange?.to?.toISOString();

            const [kpisRes, cashFlowRes, alertsRes, debtorsRes, topProductsRes] = await Promise.all([
                dashboardService.getKPIs(startDate, endDate),
                dashboardService.getCashFlow(startDate, endDate),
                dashboardService.getAlerts(startDate, endDate),
                dashboardService.getCustomersDebt(10),
                dashboardService.getTopProducts(startDate, endDate, 10)
            ]);

            if (kpisRes.success) setKpis(kpisRes.data);
            if (cashFlowRes.success) setCashFlow(cashFlowRes.data);
            if (alertsRes.success) setAlerts(alertsRes.data);
            if (debtorsRes.success) setDebtors(debtorsRes.data);
            if (topProductsRes.success) setTopProducts(topProductsRes.data);

        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilter = () => {
        fetchData();
    };

    const handleResetFilter = () => {
        setDateRange(undefined);
        setTimeout(() => fetchData(), 0);
    };

    if (isLoading && !kpis) {
        return <div className="p-8 text-center">جاري التحميل...</div>;
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[300px] justify-start text-right font-normal bg-white",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="ml-2 h-4 w-4" />
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
                            إلغاء
                        </Button>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis?.grossRevenue.toLocaleString() || 0} ج</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">النقدية المحصلة</CardTitle>
                        <CreditCard className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{kpis?.cashCollected.toLocaleString() || 0} ج</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">الديون غير المسددة</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{kpis?.outstandingDebt.toLocaleString() || 0} ج</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">اجمالي الخصومات</CardTitle>
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{kpis?.totalDiscounts.toLocaleString() || 0} ج</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">العملاء النشطون</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis?.activeCustomers || 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                    <TabsTrigger value="debtors">متابعة الديون</TabsTrigger>
                    <TabsTrigger value="operations">العمليات & التنبيهات</TabsTrigger>
                    <TabsTrigger value="products">المنتجات</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>التدفق النقدي والارادات</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={cashFlow?.timeline || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) => format(new Date(value), 'dd MMM', { locale: ar })}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <RechartsTooltip
                                                labelFormatter={(value) => format(new Date(value), 'dd MMM yyyy', { locale: ar })}
                                                formatter={(value) => [`${value} ج`, '']}
                                            />
                                            <Legend />
                                            <Line type="monotone" name="المبيعات (الإيرادات)" dataKey="revenue" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                            <Line type="monotone" name="النقدية المحصلة" dataKey="cash" stroke="#82ca9d" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>طرق الدفع</CardTitle>
                                <CardDescription>توزيع المبالغ المحصلة حسب طرق الدفع</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={cashFlow?.paymentMethods || []}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="amount"
                                                nameKey="method"
                                            >
                                                {(cashFlow?.paymentMethods || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip formatter={(value) => [`${value} ج`, 'المبلغ']} />
                                            <Legend
                                                formatter={(value) => {
                                                    const methodMap: Record<string, string> = {
                                                        'CASH': 'كاش',
                                                        'INSTAPAY': 'انستاباي',
                                                        'BANK_TRANSFER': 'تحويل بنكي',
                                                        'VODAFONE_CASH': 'فودافون كاش',
                                                        'CHEQUE': 'شيك'
                                                    };
                                                    return methodMap[value] || value;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="debtors" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-600 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                أكبر المدينين (العملاء المتأخرين)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-right">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50">
                                            <th className="h-12 px-4 font-medium text-muted-foreground">اسم العميل</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">رقم الهاتف</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground text-red-600">الدين المتبقي</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">إجمالي الطلبات</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">أيام التأخير</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {(debtors?.topDebtors || []).map((debtor) => (
                                            <tr key={debtor.customerId} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">{debtor.name}</td>
                                                <td className="p-4 align-middle">{debtor.phone}</td>
                                                <td className="p-4 align-middle font-bold text-red-600">{debtor.outstandingBalance.toLocaleString()} ج</td>
                                                <td className="p-4 align-middle">{debtor.totalOrders.toLocaleString()} ج</td>
                                                <td className="p-4 align-middle">
                                                    {debtor.daysSinceLastPayment === 9999 ? 'لم يدفع قط' : `${debtor.daysSinceLastPayment} يوم`}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="operations" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">الطلبات المحذوفة</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{alerts?.riskMetrics.deletedOrdersCount || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">دفعات محذوفة/معكوسة</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{alerts?.riskMetrics.reversedOrVoidedPaymentsCount || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">الطلبات المعدلة</CardTitle>
                                <Activity className="h-4 w-4 text-amber-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{alerts?.riskMetrics.modifiedOrdersCount || 0}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>سجل الأنشطة المشبوهة / الحساسة (الأخيرة)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-right">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50">
                                            <th className="h-12 px-4 font-medium text-muted-foreground">التاريخ</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">الإجراء</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">نوع السجل</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">المستخدم</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {(alerts?.recentSuspiciousActivityLogs || []).map((log) => (
                                            <tr key={log.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    {format(new Date(log.date), 'dd/MM/yyyy HH:mm', { locale: ar })}
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                            log.action === 'REVERSE' ? 'bg-amber-100 text-amber-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {log.action === 'DELETE' ? 'حذف' : log.action === 'REVERSE' ? 'عكس / استرجاع' : log.action}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle font-medium">
                                                    {log.entityType === 'Payment' ? `دفعة #${log.entityId}` : `طلب #${log.entityId}`}
                                                </td>
                                                <td className="p-4 align-middle">{log.user}</td>
                                            </tr>
                                        ))}
                                        {(!alerts?.recentSuspiciousActivityLogs || alerts.recentSuspiciousActivityLogs.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                                    لا توجد أنشطة مشبوهة
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                المنتجات الأكثر مبيعاً
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-right">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50">
                                            <th className="h-12 px-4 font-medium text-muted-foreground">المنتج</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">SKU</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground text-center">الكمية المباعة</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">الإيرادات المكتسبة</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">إجمالي الخصومات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {(topProducts || []).map((product) => (
                                            <tr key={product.productId} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle font-medium">{product.name}</td>
                                                <td className="p-4 align-middle text-muted-foreground">{product.sku}</td>
                                                <td className="p-4 align-middle text-center font-bold text-blue-600">{product.totalQuantitySold.toLocaleString()}</td>
                                                <td className="p-4 align-middle font-bold text-green-600">{product.totalRevenue.toLocaleString()} ج</td>
                                                <td className="p-4 align-middle text-amber-600">{product.totalDiscountsGivenOnItem.toLocaleString()} ج</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
