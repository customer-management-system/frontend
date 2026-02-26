import { OrderData } from "./schema";
import { format } from "date-fns";

interface InvoiceProps {
    order: OrderData;
    previousBalance: number;
    customerName: string;
    customerPhone: string;
}

export function Invoice({ order, customerName }: InvoiceProps) {
    const totalAmount = Number(order.total_amount) || 0;
    const discountAmount = Number(order.discount_amount) || 0;
    const paidAmount = Number(order.paid_amount) || 0;
    const balance = Number(order.balance) || 0;
    const currentTotalBalance = Number(order.currentTotalBalance) || 0;

    // المسميات بناء على طلب العميل
    const statementValue = discountAmount + totalAmount; // قيمة البيان
    const prevBalance = currentTotalBalance - balance; // الرصيد السابق
    const totalQuantity = order.items.reduce((sum, item) => sum + Number(item.quantity), 0); // اجمالي الكمية

    return (
        <div className="hidden print:block print:absolute print:inset-0 print:m-0 print:w-full print:max-w-[210mm] print:mx-auto print:h-auto p-8 text-right bg-white text-black leading-tight print:scale-100 print:origin-top" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div className="text-center w-1/3">
                    <h2 className="text-xl font-bold">رقم باتش: {order.invoice?.number || order.id}</h2>
                </div>
                <div className="text-center w-1/3 font-bold text-lg">
                    <span>التاريخ: {format(new Date(order.created_at), 'yyyy/MM/dd')}</span>
                </div>
                <div className="text-right w-1/3 font-bold text-lg flex flex-col items-start">
                    <span>كود العميل: {order.customer_id}</span>
                </div>
            </div>

            {/* Customer Info (To Match The Image More Closely, if we wanted to show Name there, we can add it here too as requested)
                In the image, the top header only has: Date | Batch Number | Customer Code. 
                I'll keep a small text indicating customer name just to be safe as the user provided 'عمو محمد'. Wait, image has 'عمو محمد' as the customer name? Actually the image doesn't explicitly show 'العميل: ...', it just has the table. I'll add the customer name since it's an important field in standard invoices.
            */}
            <div className="flex justify-between mb-4 font-bold text-lg">
                <div>العميل: {customerName}</div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse border-2 border-black mb-6 text-sm font-bold print:border-collapse">
                <thead>
                    <tr className="bg-black text-white print:bg-white print:text-black">
                        <th className="border-x-2 border-black p-2 w-10 text-center">م</th>
                        <th className="border-x-2 border-black p-2 text-center">اسم الصنف</th>
                        <th className="border-x-2 border-black p-2 w-20 text-center">الوحدة</th>
                        <th className="border-x-2 border-black p-2 w-20 text-center">الكمية</th>
                        <th className="border-x-2 border-black p-2 w-24 text-center">السعر</th>
                        <th className="border-x-2 border-black p-2 w-28 text-center">القيمة</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, index) => (
                        <tr key={item.id} className="border-b-2 border-black">
                            <td className="border-x-2 border-black p-2 text-center">{index + 1}</td>
                            <td className="border-x-2 border-black p-2 text-center">{item.product_name}</td>
                            <td className="border-x-2 border-black p-2 text-center">الكيلو</td>
                            <td className="border-x-2 border-black p-2 text-center">{item.quantity}</td>
                            <td className="border-x-2 border-black p-2 text-center">{Number(item.unit_price).toFixed(2)}</td>
                            <td className="border-x-2 border-black p-2 text-center">{Number(item.subtotal).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Footer Calculation Area */}
            <div className="flex justify-between items-start gap-4">
                {/* Right Side (Quantities & Balances) */}
                <div className="w-[45%] flex flex-col gap-4">
                    <div className="border-2 border-black rounded-xl overflow-hidden text-lg font-bold">
                        <div className="bg-black text-white text-center p-2">اجمالي الكمية</div>
                        <div className="text-center p-3 text-xl">{totalQuantity}</div>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1 border-2 border-black rounded-xl overflow-hidden text-sm font-bold">
                            <div className="bg-black text-white text-center p-2 h-14 flex items-center justify-center">اجمالي الكمية الشهرى</div>
                            <div className="text-center p-3 text-lg">-</div>
                        </div>
                        <div className="flex-1 border-2 border-black rounded-xl overflow-hidden text-sm font-bold">
                            <div className="bg-black text-white text-center p-2 h-14 flex items-center justify-center">باقى على العميل قبل المراجعة</div>
                            <div className="text-center p-3 text-lg">{currentTotalBalance.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {/* Left Side (Totals) */}
                <div className="w-[50%] text-sm font-bold border-2 border-black rounded-xl overflow-hidden flex flex-col">
                    <div className="flex border-b-2 border-black">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">قيمة البيان</div>
                        <div className="w-1/2 p-2 px-4 text-center">{statementValue.toFixed(2)}</div>
                    </div>
                    <div className="flex border-b-2 border-black">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">الخصم النقدي</div>
                        <div className="w-1/2 p-2 px-4 text-center">{discountAmount.toFixed(2)}</div>
                    </div>
                    <div className="flex border-b-2 border-black">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">قيمه البيان بعد الخصم</div>
                        <div className="w-1/2 p-2 px-4 text-center">{totalAmount.toFixed(2)}</div>
                    </div>
                    <div className="flex border-b-2 border-black">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">المسدد</div>
                        <div className="w-1/2 p-2 px-4 text-center">{paidAmount.toFixed(2)}</div>
                    </div>
                    <div className="flex border-b-2 border-black">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">قيمه البيان بعد المسدد والخصم</div>
                        <div className="w-1/2 p-2 px-4 text-center">{balance.toFixed(2)}</div>
                    </div>
                    <div className="flex border-b-2 border-black">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">الرصيد السابق</div>
                        <div className="w-1/2 p-2 px-4 text-center">{prevBalance.toFixed(2)}</div>
                    </div>
                    <div className="flex border-b-2 border-black">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">اجمالي البيان بالرصيد</div>
                        <div className="w-1/2 p-2 px-4 text-center">{currentTotalBalance.toFixed(2)}</div>
                    </div>
                    <div className="flex border-b-2 border-black">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">إجمالى المطلوب سداده</div>
                        <div className="w-1/2 p-2 px-4 text-center">{currentTotalBalance.toFixed(2)}</div>
                    </div>
                    <div className="flex">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">الباقى</div>
                        <div className="w-1/2 p-2 px-4 text-center">{currentTotalBalance.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 border-2 border-black rounded-lg text-sm font-bold text-right">
                <p className="mb-2">قيمة البيان فقط وقدره ........................................................................................</p>
                <p>ملحوظة هامة : هذا البيان للاسترشاد فقط وليس كشف حساب</p>
            </div>
            <div className="flex justify-end mt-4">
                <div className="mb-2 text-center border-2 border-black p-4 rounded-xl font-bold bg-gray-100">
                    <div>للتواصل</div>
                    <div dir="ltr" className="text-xl">01122230321</div>
                </div>
            </div>
        </div>
    );
}

