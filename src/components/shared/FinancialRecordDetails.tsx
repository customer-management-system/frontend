import { OrderItemRef } from '@/features/financials/schema';

const formatValue = (value: number) => value.toLocaleString('en-US');

export function FinancialOrderDetails({
    items,
    notes,
    totalItems,
    discountAmount,
    discountType,
    paidAmount,
    balance,
    createdBy,
    isModified,
}: {
    items?: OrderItemRef[];
    notes?: string | null;
    totalItems?: number;
    discountAmount?: number;
    discountType?: string | null;
    paidAmount?: number;
    balance?: number;
    createdBy?: { username: string } | null;
    isModified?: boolean;
}) {
    const hasItems = items && items.length > 0;

    return (
        <div className="space-y-1 text-xs max-w-md">
            {hasItems ? (
                items.map((item, idx) => (
                    <div key={idx} className="rounded border bg-muted/30 px-2 py-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-muted-foreground">
                            الكمية: {item.quantity} | السعر: {formatValue(item.unit_price)} | الإجمالي: {formatValue(item.subtotal)}
                        </div>
                    </div>
                ))
            ) : notes ? (
                <div className="rounded border bg-amber-50 px-2 py-1 text-amber-900">
                    {notes}
                </div>
            ) : (
                <span className="text-muted-foreground">—</span>
            )}

            <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                {totalItems != null && totalItems > 0 && <span>إجمالي الكمية: {totalItems}</span>}
                {discountAmount != null && discountAmount > 0 && (
                    <span>
                        خصم: {formatValue(discountAmount)}
                        {discountType === 'percentage' ? '%' : ' جنيه'}
                    </span>
                )}
                {paidAmount != null && paidAmount > 0 && <span>مدفوع: {formatValue(paidAmount)}</span>}
                {balance != null && balance > 0 && <span>متبقي: {formatValue(balance)}</span>}
                {createdBy && <span>بواسطة: {createdBy.username}</span>}
                {isModified && <span className="text-orange-600">تم تعديله</span>}
            </div>
        </div>
    );
}

export function FinancialPaymentDetails({
    method,
    notes,
    referenceNumber,
    linkedOrderId,
    status,
    createdBy,
}: {
    method?: string;
    notes?: string | null;
    referenceNumber?: string | null;
    linkedOrderId?: number | null;
    status?: string;
    createdBy?: { username: string } | null;
}) {
    return (
        <div className="space-y-1 text-xs max-w-md">
            {method && (
                <div className="rounded border bg-green-50 px-2 py-1">
                    طريقة الدفع: {method}
                </div>
            )}
            {notes && (
                <div className="rounded border bg-muted/30 px-2 py-1">
                    ملاحظات: {notes}
                </div>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                {referenceNumber && <span>مرجع: {referenceNumber}</span>}
                {linkedOrderId && <span>طلب #{linkedOrderId}</span>}
                {status && <span>الحالة: {status}</span>}
                {createdBy && <span>بواسطة: {createdBy.username}</span>}
            </div>
        </div>
    );
}

export function FinancialReturnDetails({
    items,
    notes,
    totalItems,
    createdBy,
}: {
    items?: OrderItemRef[];
    notes?: string | null;
    totalItems?: number;
    createdBy?: { username: string } | null;
}) {
    return (
        <div className="space-y-1 text-xs max-w-md">
            {items?.map((item, idx) => (
                <div key={idx} className="rounded border border-teal-200 bg-teal-50 px-2 py-1">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-muted-foreground">
                        الكمية: {item.quantity} | السعر: {formatValue(item.unit_price)} | الإجمالي: {formatValue(item.subtotal)}
                    </div>
                </div>
            ))}
            {notes && (
                <div className="rounded border bg-muted/30 px-2 py-1">
                    ملاحظات: {notes}
                </div>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                {totalItems != null && totalItems > 0 && <span>إجمالي الكمية: {totalItems}</span>}
                {createdBy && <span>بواسطة: {createdBy.username}</span>}
            </div>
        </div>
    );
}
