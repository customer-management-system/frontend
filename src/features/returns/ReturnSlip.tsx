import { ReturnData } from "./schema";
import { format } from "date-fns";

interface ReturnSlipProps {
    returnRecord: ReturnData;
    customerName: string;
}

export function ReturnSlip({ returnRecord, customerName }: ReturnSlipProps) {
    const totalAmount = Number(returnRecord.total_amount) || 0;
    const totalQuantity = (returnRecord.items ?? []).reduce(
        (sum, item) => sum + Number(item.quantity),
        0,
    );

    return (
        <div className="p-8 text-right bg-white text-black leading-tight w-full max-w-[210mm] mx-auto" dir="rtl">
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div className="text-center w-1/3">
                    <h2 className="text-xl font-bold">إشعار مرتجع #{returnRecord.id}</h2>
                </div>
                <div className="text-center w-1/3 font-bold text-lg">
                    <span>التاريخ: {format(new Date(returnRecord.created_at), 'yyyy/MM/dd')}</span>
                </div>
                <div className="text-right w-1/3 font-bold text-lg flex flex-col items-start">
                    <span>كود العميل: {returnRecord.customer_id || returnRecord.customer?.id}</span>
                </div>
            </div>

            <div className="flex justify-between mb-4 font-bold text-lg">
                <div>العميل: {customerName}</div>
            </div>

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
                    {(returnRecord.items ?? []).map((item, index) => (
                        <tr key={item.id} className="border-b-2 border-black">
                            <td className="border-x-2 border-black p-2 text-center">{index + 1}</td>
                            <td className="border-x-2 border-black p-2 text-center">
                                {item.product_name || ''}
                            </td>
                            <td className="border-x-2 border-black p-2 text-center">الكيلو</td>
                            <td className="border-x-2 border-black p-2 text-center">{item.quantity}</td>
                            <td className="border-x-2 border-black p-2 text-center">
                                {Number(item.unit_price).toFixed(2)}
                            </td>
                            <td className="border-x-2 border-black p-2 text-center">
                                {Number(item.subtotal).toFixed(2)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-between items-start gap-4">
                <div className="w-[45%] flex flex-col gap-4">
                    <div className="border-2 border-black rounded-xl overflow-hidden text-lg font-bold">
                        <div className="bg-black text-white text-center p-2">اجمالي الكمية</div>
                        <div className="text-center p-3 text-xl">{totalQuantity}</div>
                    </div>
                </div>

                <div className="w-[50%] text-sm font-bold border-2 border-black rounded-xl overflow-hidden flex flex-col">
                    <div className="flex border-b-2 border-black">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">قيمة المرتجع</div>
                        <div className="w-1/2 p-2 px-4 text-center">{totalAmount.toFixed(2)}</div>
                    </div>
                    <div className="flex">
                        <div className="w-1/2 p-2 px-4 text-left border-l-2 border-black">الرصيد بعد المرتجع</div>
                        <div className="w-1/2 p-2 px-4 text-center">
                            {(returnRecord.currentTotalBalance ?? 0).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            {returnRecord.notes && (
                <div className="mt-6 p-4 border-2 border-black rounded-lg text-sm font-bold">
                    ملاحظات: {returnRecord.notes}
                </div>
            )}

            <div className="mt-8 p-4 border-2 border-black rounded-lg text-sm font-bold text-right">
                <p>ملحوظة: هذا الإشعار يخص مرتجع بضاعة ويخصم من رصيد العميل</p>
            </div>
        </div>
    );
}
