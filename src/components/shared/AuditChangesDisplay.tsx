import { FormattedAuditChanges } from '@/features/customers/schema';

const FIELD_LABELS: Record<string, string> = {
    totalAmount: 'الإجمالي',
    discountValue: 'الخصم',
    discountType: 'نوع الخصم',
    amount: 'المبلغ',
    method: 'طريقة الدفع',
    notes: 'ملاحظات',
    referenceNumber: 'رقم المرجع',
    status: 'الحالة',
    quantity: 'الكمية',
    unitPrice: 'السعر',
    productName: 'المنتج',
};

const formatValue = (value: unknown) => {
    if (value == null || value === '') return '—';
    if (typeof value === 'number') return value.toLocaleString('en-US');
    return String(value);
};

const ChangeRow = ({ label, oldValue, newValue }: { label: string; oldValue: unknown; newValue: unknown }) => (
    <div className="bg-muted/50 rounded px-2 py-1">
        <span className="font-medium">{label}: </span>
        <span className="text-red-600 line-through">{formatValue(oldValue)}</span>
        <span className="mx-1 text-muted-foreground">←</span>
        <span className="text-green-700 font-medium">{formatValue(newValue)}</span>
    </div>
);

const ItemLine = ({
    productName,
    quantity,
    unitPrice,
    tone = 'default',
}: {
    productName: string;
    quantity: number;
    unitPrice: number;
    tone?: 'default' | 'added' | 'removed';
}) => {
    const toneClass =
        tone === 'added'
            ? 'border-green-200 bg-green-50'
            : tone === 'removed'
              ? 'border-red-200 bg-red-50'
              : 'border-border bg-muted/40';

    return (
        <div className={`rounded border px-2 py-1 ${toneClass}`}>
            <div className="font-medium">{productName}</div>
            <div className="text-muted-foreground">
                الكمية: {quantity} | السعر: {formatValue(unitPrice)}
            </div>
        </div>
    );
};

interface AuditChangesDisplayProps {
    changes?: FormattedAuditChanges | null;
    compact?: boolean;
}

export function AuditChangesDisplay({ changes, compact = false }: AuditChangesDisplayProps) {
    if (!changes) {
        return <span className="text-muted-foreground">—</span>;
    }

    const { fields, items, snapshot } = changes;
    const fieldEntries = Object.entries(fields ?? {});
    const hasItemsDiff =
        items &&
        (items.added.length > 0 ||
            items.removed.length > 0 ||
            items.modified.length > 0 ||
            (items.legacy?.length ?? 0) > 0);
    const hasSnapshot = snapshot && (snapshot.items?.length || snapshot.amount != null || snapshot.totalAmount != null);

    if (fieldEntries.length === 0 && !hasItemsDiff && !hasSnapshot) {
        return <span className="text-muted-foreground">—</span>;
    }

    return (
        <div className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            {fieldEntries.map(([key, value]) => (
                <ChangeRow
                    key={key}
                    label={FIELD_LABELS[key] ?? key}
                    oldValue={value.old}
                    newValue={value.new}
                />
            ))}

            {items?.removed.map((item, idx) => (
                <div key={`removed-${idx}`} className="space-y-0.5">
                    <div className="text-red-700 font-medium">تم الحذف:</div>
                    <ItemLine
                        productName={item.productName}
                        quantity={item.quantity}
                        unitPrice={item.unitPrice}
                        tone="removed"
                    />
                </div>
            ))}

            {items?.added.map((item, idx) => (
                <div key={`added-${idx}`} className="space-y-0.5">
                    <div className="text-green-700 font-medium">تمت الإضافة:</div>
                    <ItemLine
                        productName={item.productName}
                        quantity={item.quantity}
                        unitPrice={item.unitPrice}
                        tone="added"
                    />
                </div>
            ))}

            {items?.modified.map((item, idx) => (
                <div key={`modified-${idx}`} className="space-y-1">
                    <div className="font-medium">{item.productName}</div>
                    {Object.entries(item.changes).map(([key, value]) => (
                        <ChangeRow
                            key={key}
                            label={FIELD_LABELS[key] ?? key}
                            oldValue={value.old}
                            newValue={value.new}
                        />
                    ))}
                </div>
            ))}

            {items?.legacy?.map((item, idx) => (
                <ItemLine
                    key={`legacy-${idx}`}
                    productName={item.productName}
                    quantity={item.quantity}
                    unitPrice={item.unitPrice}
                />
            ))}

            {snapshot?.notes && (
                <div className="bg-muted/50 rounded px-2 py-1">
                    <span className="font-medium">ملاحظات: </span>
                    {snapshot.notes}
                </div>
            )}

            {snapshot?.method && (
                <div className="bg-muted/50 rounded px-2 py-1">
                    <span className="font-medium">طريقة الدفع: </span>
                    {snapshot.method}
                </div>
            )}

            {snapshot?.items?.map((item, idx) => (
                <ItemLine
                    key={`snapshot-${idx}`}
                    productName={item.productName}
                    quantity={item.quantity}
                    unitPrice={item.unitPrice}
                />
            ))}
        </div>
    );
}

export function DeletedRecordDetails({
    type,
    description,
    items,
    method,
    quantity,
}: {
    type: 'ORDER' | 'PAYMENT' | 'RETURN';
    description: string;
    items?: { productName: string; quantity: number; unitPrice: number }[];
    method?: string;
    quantity?: number;
}) {
    return (
        <div className="space-y-1 text-sm">
            <div>{description}</div>
            {type === 'PAYMENT' && method && (
                <div className="text-muted-foreground text-xs">طريقة الدفع: {method}</div>
            )}
            {(type === 'ORDER' || type === 'RETURN') && items && items.length > 0 && (
                <div className="space-y-1 mt-1">
                    {items.map((item, idx) => (
                        <ItemLine
                            key={idx}
                            productName={item.productName}
                            quantity={item.quantity}
                            unitPrice={item.unitPrice}
                            tone="removed"
                        />
                    ))}
                    {quantity != null && quantity > 0 && (
                        <div className="text-xs text-muted-foreground">إجمالي الكمية: {quantity}</div>
                    )}
                </div>
            )}
        </div>
    );
}
