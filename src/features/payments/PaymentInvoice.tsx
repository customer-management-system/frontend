import { format } from "date-fns";
import { ar } from "date-fns/locale";

export interface PaymentData {
    id: number;
    customer: {
        id: number;
        name: string;
    };
    customer_id: number;
    amount: number;
    method: string;
    status: string;
    notes: string;
    created_by: {
        id: number;
        username: string;
    };
    created_at: string;
    balance_before_payment: number;
    customer_balance: number;
    discount_amount: number;
}

interface PaymentInvoiceProps {
    payment: PaymentData;
}

const translateMethod = (method: string) => {
    const methodLower = method.toLowerCase();
    switch (methodLower) {
        case 'cash': return 'كاش';
        case 'instapay': return 'انستاباي';
        case 'vodafone_cash': return 'فودافون كاش';
        case 'bank_transfer': return 'تحويل بنكي';
        case 'cheque': return 'شيك';
        default: return method;
    }
}

export function PaymentInvoice({ payment }: PaymentInvoiceProps) {
    return (
        <div className="hidden print:block print:absolute print:inset-0 print:m-0 print:w-full print:max-w-[210mm] print:mx-auto print:h-auto p-4 text-center bg-white text-black font-bold leading-tight print:scale-100 print:origin-top" dir="rtl">

            <div className="mb-8">
                <h1 className="text-xl">إستلام نقدية</h1>
            </div>

            <table className="w-full border-collapse border-2 border-black text-sm print:border-collapse text-center">
                <tbody>
                    <tr className="border-b-2 border-black">
                        <td className="border-x-2 border-black p-2 w-1/5">التاريخ</td>
                        <td className="border-x-2 border-black p-2 w-1/5">{format(new Date(payment.created_at), 'dd/MM/yyyy')}</td>
                        <td className="border-x-2 border-black p-2 w-1/5">{format(new Date(payment.created_at), 'hh:mm:ss a', { locale: ar })}</td>
                        <td className="border-x-2 border-black p-2 w-1/5">رقم الفاتورة</td>
                        <td className="border-x-2 border-black p-2 w-1/5">{payment.id}</td>
                    </tr>

                    <tr className="border-b-2 border-black">
                        <td className="border-x-2 border-black p-2">الإسم</td>
                        <td className="border-x-2 border-black p-2" colSpan={2}>{payment.customer.name}</td>
                        <td className="border-x-2 border-black p-2">المندوب</td>
                        <td className="border-x-2 border-black p-2"></td>
                    </tr>

                    <tr className="border-b-2 border-black">
                        <td className="border-x-2 border-black p-2">رقم الدفتر</td>
                        <td className="border-x-2 border-black p-2" colSpan={2}></td>
                        <td className="border-x-2 border-black p-2">الكاتب</td>
                        <td className="border-x-2 border-black p-2">{payment.created_by.username}</td>
                    </tr>

                    <tr className="border-b-2 border-black">
                        <td className="border-x-2 border-black p-2">الخزينه</td>
                        <td className="border-x-2 border-black p-2" colSpan={4}>الخزينه الرئيسيه</td>
                    </tr>

                    <tr className="border-b-2 border-black h-16">
                        <td className="border-x-2 border-black p-2">المبلغ</td>
                        <td className="border-x-2 border-black p-2">{payment.amount}</td>
                        <td className="border-x-2 border-black p-2 relative" colSpan={3}>
                            {`فقط وقدره ${payment.amount} جنيهاً لا غير`}
                        </td>
                    </tr>

                    <tr className="border-b-2 border-black">
                        <td className="border-x-2 border-black p-2">وذلك عن طريق</td>
                        <td className="border-x-2 border-black p-2" colSpan={4}>{translateMethod(payment.method)}</td>
                    </tr>


                    <tr className="border-b-2 border-black">
                        <td className="border-x-2 border-black p-2">ملاحظات</td>
                        <td className="border-x-2 border-black p-2" colSpan={4}>{payment.notes || ''}</td>
                    </tr>

                    <tr className="border-b-2 border-black">
                        <td className="border-x-2 border-black p-2">الحساب السابق</td>
                        <td className="border-x-2 border-black p-2">{payment.balance_before_payment}</td>
                        <td className="border-x-2 border-black p-2">الرصيد الحالي</td>
                        <td className="border-x-2 border-black p-2">{payment.customer_balance}</td>
                        {/* <td className="border-x-2 border-black p-2"></td> */}
                    </tr>
                </tbody>
            </table>

            <div className="mt-8 flex justify-between px-10">
                <div className="text-center font-bold">
                    <p className="mb-2">اسم المستلم / ........................</p>
                    <p>التوقيع / ........................</p>
                </div>
            </div>

            <div className="mt-8 text-center text-lg font-bold">
                <p>مع تحياتى</p>
            </div>
            <div className="mt-8 flex justify-end px-10">
                <div className="text-center font-bold">
                    <p className="mb-2">
                        للتواصل
                    </p>
                    <p>01122230321</p>
                </div>
            </div>
        </div>
    )
}
