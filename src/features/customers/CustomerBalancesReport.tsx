import { Customer } from "./schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CustomerBalancesReportProps {
    customers: Customer[];
}

// Group definitions
const GROUPS = [
    { id: '0-50k', label: 'من 0 حتى 50,000', min: 0, max: 50000 },
    { id: '50k-100k', label: 'من 50,000 حتى 100,000', min: 50000, max: 100000 },
    { id: '100k-200k', label: 'من 100,000 حتى 200,000', min: 100000, max: 200000 },
    { id: '>200k', label: 'أكثر من 200,000', min: 200000, max: Infinity },
];

export function CustomerBalancesReport({ customers }: CustomerBalancesReportProps) {
    const todayDate = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
    const todayDay = format(new Date(), 'EEEE', { locale: ar });

    // Filter customers who have a positive balance (they owe money)
    // The requirement says "amount they owe", which usually means outstanding_balance > 0
    const owingCustomers = customers.filter(c => (c.outstanding_balance || 0) > 0);

    // Group customers
    const groupedCustomers = GROUPS.map(group => {
        const groupCustomers = owingCustomers.filter(c => {
            const balance = c.outstanding_balance || 0;
            // Exclusive on the max for the first 3 groups to avoid overlap (e.g. exactly 50000 goes to which?)
            // Let's do: min < balance <= max
            return balance > group.min && balance <= group.max;
        });

        // Special case for the first group to include 0 if needed, but we filtered for > 0 above.
        // Actually, if they owe exactly 0, they are not strictly "owing". We will just do balance >= min && balance <= max
        // Wait, "0 - 50,000" usually means > 0 and <= 50,000. Let's adjust filtering to be strictly owingCustomers.
        
        // Sort by balance descending
        groupCustomers.sort((a, b) => (b.outstanding_balance || 0) - (a.outstanding_balance || 0));

        return {
            ...group,
            customers: groupCustomers
        };
    }).filter(g => g.customers.length > 0); // Only show groups that have customers

    return (
        <div className="hidden print-balances-container w-full bg-white text-black p-4 text-xs xl:text-sm" dir="rtl">
            <div className="text-center mb-6">
                <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
                    <span className="font-bold">{todayDay} {todayDate}</span>
                    <h1 className="text-2xl font-bold">تقرير ارصدة العملاء</h1>
                    <span className="font-bold"></span>
                </div>
            </div>

            {groupedCustomers.map((group, groupIndex) => (
                <div key={group.id} className={`mb-8 ${groupIndex > 0 ? 'page-break' : ''}`}>
                    <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2 border border-black text-center">
                        عملاء الفئة: {group.label} (عدد: {group.customers.length})
                    </h2>
                    <table className="w-full border-collapse border border-black text-center text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th rowSpan={2} className="border border-black p-2 font-bold w-16">رقم</th>
                                <th rowSpan={2} className="border border-black p-2 font-bold">اسماء العملاء</th>
                                <th colSpan={2} className="border border-black p-2 font-bold">رصيد اول المدة</th>
                                <th colSpan={2} className="border border-black p-2 font-bold">الحركات الحالية</th>
                                <th colSpan={2} className="border border-black p-2 font-bold">رصيد اخر المدة</th>
                            </tr>
                            <tr>
                                <th className="border border-black p-1 font-bold w-20">مدين</th>
                                <th className="border border-black p-1 font-bold w-20">دائن</th>
                                <th className="border border-black p-1 font-bold w-20">مدين</th>
                                <th className="border border-black p-1 font-bold w-20">دائن</th>
                                <th className="border border-black p-1 font-bold w-20">مدين</th>
                                <th className="border border-black p-1 font-bold w-20">دائن</th>
                            </tr>
                        </thead>
                        <tbody>
                            {group.customers.map((customer) => {
                                const balance = customer.outstanding_balance || 0;
                                const isDebit = balance > 0;
                                const isCredit = balance < 0;
                                
                                return (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="border border-black p-2">{customer.id}</td>
                                        <td className="border border-black p-2 text-right">{customer.name}</td>
                                        
                                        {/* رصيد اول المدة */}
                                        <td className="border border-black p-2">0</td>
                                        <td className="border border-black p-2">0</td>
                                        
                                        {/* الحركات الحالية */}
                                        <td className="border border-black p-2">0</td>
                                        <td className="border border-black p-2">0</td>
                                        
                                        {/* رصيد اخر المدة */}
                                        <td className="border border-black p-2 font-semibold">
                                            {isDebit ? balance.toLocaleString() : '0'}
                                        </td>
                                        <td className="border border-black p-2 font-semibold">
                                            {isCredit ? Math.abs(balance).toLocaleString() : '0'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100 font-bold">
                                <td colSpan={2} className="border border-black p-2 text-left">إجمالي الفئة</td>
                                <td className="border border-black p-2">0</td>
                                <td className="border border-black p-2">0</td>
                                <td className="border border-black p-2">0</td>
                                <td className="border border-black p-2">0</td>
                                <td className="border border-black p-2">
                                    {group.customers.reduce((sum, c) => {
                                        const bal = c.outstanding_balance || 0;
                                        return sum + (bal > 0 ? bal : 0);
                                    }, 0).toLocaleString()}
                                </td>
                                <td className="border border-black p-2">
                                    {group.customers.reduce((sum, c) => {
                                        const bal = c.outstanding_balance || 0;
                                        return sum + (bal < 0 ? Math.abs(bal) : 0);
                                    }, 0).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            ))}
            
            {groupedCustomers.length === 0 && (
                <div className="text-center p-8 border border-black">
                    لا يوجد عملاء عليهم مديونيات في الوقت الحالي.
                </div>
            )}
        </div>
    );
}
