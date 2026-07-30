import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { FinancialHistoryResponse, Customer } from "./schema";

interface CustomerStatementReportProps {
    customer: Customer;
    financialHistory: FinancialHistoryResponse['data'] | null;
    startDate?: Date;
    endDate?: Date;
}

export function CustomerStatementReport({ customer, financialHistory, startDate, endDate }: CustomerStatementReportProps) {
    if (!financialHistory) return null;

    const todayDate = format(new Date(), 'dd/MM/yyyy', { locale: ar });
    const todayTime = format(new Date(), 'HH:mm:ss');
    const todayDay = format(new Date(), 'EEEE', { locale: ar });

    const formattedStartDate = startDate ? format(startDate, 'dd/MM/yyyy') : '';
    const formattedEndDate = endDate ? format(endDate, 'dd/MM/yyyy') : todayDate;

    // Filter out deleted/reversed records if they shouldn't show up in statement, or keep them if business logic dictates.
    // Usually statements show only applied transactions.
    const activeRecords = financialHistory.history.filter(r => r.status !== 'deleted' && r.status !== 'reversed');
    
    // Sort oldest to newest for chronological statement printing
    const sortedRecords = [...activeRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalDebit = 0; // مدين (عليه)
    let totalCredit = 0; // دائن (له)

    return (
        <div id="statement-print-area" className="hidden print:block w-full bg-white text-black print:p-4 text-xs xl:text-sm" dir="rtl">
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #statement-print-area, #statement-print-area * {
                            visibility: visible;
                        }
                        #statement-print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        @page {
                            size: A4 portrait;
                            margin: 1cm;
                        }
                        .page-break {
                            page-break-before: always;
                        }
                        table {
                            page-break-inside: auto;
                        }
                        tr {
                            page-break-inside: avoid;
                            page-break-after: auto;
                        }
                        thead {
                            display: table-header-group;
                        }
                    }
                `}
            </style>
            
            <div className="mb-6 flex flex-col gap-2 border-b-2 border-black pb-2">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <span>{todayTime}</span>
                        <span>{todayDay} {todayDate}</span>
                    </div>
                    {formattedStartDate ? (
                        <div className="font-bold text-lg">
                            <span>'{formattedEndDate}'</span> <span className="mx-4">'{formattedStartDate}'</span>
                        </div>
                    ) : (
                        <div className="font-bold text-lg">
                            كشف حساب شامل حتى '{formattedEndDate}'
                        </div>
                    )}
                    <span className="font-bold text-lg"></span>
                </div>
                
                <table className="w-full border-collapse border-2 border-black mt-2 text-center text-sm font-bold">
                    <tbody>
                        <tr>
                            <td className="border border-black p-2 w-1/4">{customer.id}</td>
                            <td className="border border-black p-2 w-1/4">{customer.name}</td>
                            <td className="border border-black p-2 w-1/2" colSpan={2}>كشف حساب العميل</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <table className="w-full border-collapse border border-black text-center text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th rowSpan={2} colSpan={2} className="border border-black p-2 font-bold min-w-[100px]">الرصيد</th>
                        <th colSpan={2} className="border border-black p-2 font-bold">الحركات الحالية</th>
                        <th rowSpan={2} className="border border-black p-2 font-bold w-20">رقم</th>
                        <th rowSpan={2} className="border border-black p-2 font-bold w-24">التاريخ</th>
                        <th rowSpan={2} className="border border-black p-2 font-bold min-w-[200px]">البيان</th>
                    </tr>
                    <tr>
                        <th className="border border-black p-1 font-bold w-24">دائن - له (مدفوع)</th>
                        <th className="border border-black p-1 font-bold w-24">مدين - عليه (طلب)</th>
                        <th className="border border-black p-1 font-bold w-24">دائن</th>
                        <th className="border border-black p-1 font-bold w-24">مدين</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Previous Balance Row could go here if we tracked it historically.
                        For now, assuming runningBalance on first record gives context, or we just rely on runningBalance column.*/}

                    {sortedRecords.map((record, index) => {
                        const isPayment = record.type === 'PAYMENT';
                        const isOrder = record.type === 'ORDER';
                        
                        const debit = isOrder ? record.amount : 0;
                        const credit = isPayment ? record.amount : 0;
                        
                        totalDebit += debit;
                        totalCredit += credit;

                        const bal = record.runningBalance;
                        const balCredit = bal < 0 ? Math.abs(bal) : 0;
                        const balDebit = bal > 0 ? bal : 0;

                        return (
                            <tr key={record.id} className="hover:bg-gray-50">
                                <td className="border border-black p-2 font-semibold text-green-700">{balCredit > 0 ? balCredit.toLocaleString() : '0'}</td>
                                <td className="border border-black p-2 font-semibold text-red-700">{balDebit > 0 ? balDebit.toLocaleString() : '0'}</td>
                                
                                <td className="border border-black p-2 text-green-600">{credit > 0 ? credit.toLocaleString() : '0'}</td>
                                <td className="border border-black p-2 text-red-600">{debit > 0 ? debit.toLocaleString() : '0'}</td>
                                
                                <td className="border border-black p-2">{record.referenceId}</td>
                                <td className="border border-black p-2">{format(new Date(record.date), 'dd/MM/yyyy')}</td>
                                
                                <td className="border border-black p-2 text-right">
                                    <div className="font-bold flex justify-between">
                                        <span>{isPayment ? 'استلام نقديه' : 'مبيعات'} - {record.description}</span>
                                    </div>
                                    {isOrder && record.items && record.items.length > 0 && (
                                        <div className="mt-1 text-xs">
                                            <ul className="list-none m-0 p-0 text-gray-700">
                                                {record.items.map((item, idx) => (
                                                    <li key={idx} className="flex justify-between border-b border-gray-100 last:border-0 py-0.5">
                                                        <span>{item.productName}</span>
                                                        <span className="text-gray-500">
                                                            {item.quantity} كمية * {item.unitPrice} السعر = {item.quantity * item.unitPrice} 
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {(record.discountAmount || 0) > 0 && (
                                                <div className="text-green-600 font-semibold mt-1">
                                                    خصم مضاف: {record.discountAmount}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            
            <div className="mt-8">
                <table className="w-full text-center text-sm font-bold border-t-2 border-black">
                    <tbody>
                        <tr>
                            <td className="p-2 w-1/4"></td>
                            <td className="p-2 w-1/4"></td>
                            <td className="p-2 w-1/4 border-b border-black">دائن - له</td>
                            <td className="p-2 w-1/4 border-b border-black">مدين - عليه</td>
                        </tr>
                        <tr>
                            <td className="p-2 text-right">سابقه</td>
                            <td className="p-2 text-right"></td>
                            <td className="p-2 text-green-700">{totalCredit.toLocaleString()}</td>
                            <td className="p-2 text-red-700">{totalDebit.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td className="p-2 text-right border-b border-black">مربوطه</td>
                            <td className="p-2 text-right border-b border-black"></td>
                            <td className="p-2 border-b border-black">0</td>
                            <td className="p-2 border-b border-black">0</td>
                        </tr>
                        <tr>
                            <td className="p-2 text-right font-bold text-lg">الرصيد الحالى</td>
                            <td className="p-2 text-right"></td>
                            <td className="p-2 font-bold text-lg text-green-700 text-center" colSpan={2}>
                                {customer.outstanding_balance && customer.outstanding_balance > 0 ? (
                                    <span className="text-red-600">علية: {customer.outstanding_balance.toLocaleString()} جنية</span>
                                ) : customer.outstanding_balance && customer.outstanding_balance < 0 ? (
                                     <span className="text-green-600">لة: {Math.abs(customer.outstanding_balance).toLocaleString()} جنية</span>
                                ) : (
                                    <span>صفر</span>
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            {sortedRecords.length === 0 && (
                <div className="text-center p-8 border border-black mt-4 font-bold">
                    لا يوجد حركات مالية في هذه الفترة.
                </div>
            )}
        </div>
    );
}
