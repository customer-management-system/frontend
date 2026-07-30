export function formatCurrency(value: number | string | null | undefined): string {
    const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
    if (Number.isNaN(num)) return '0.00 ج.م';

    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
}
