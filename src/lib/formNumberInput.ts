export function parseOptionalInt(value: string): number | undefined {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const parsed = parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
}

export function parseOptionalFloat(value: string): number | undefined {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const parsed = parseFloat(trimmed);
    return Number.isNaN(parsed) ? undefined : parsed;
}

export function numberInputValue(value: number | undefined | null): string {
    if (value === undefined || value === null) return '';
    return String(value);
}
