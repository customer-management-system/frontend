function getResponseData(error: unknown): Record<string, unknown> | undefined {
    if (error && typeof error === 'object' && 'response' in error) {
        const response = (error as { response?: { data?: unknown } }).response;
        if (response?.data && typeof response.data === 'object') {
            return response.data as Record<string, unknown>;
        }
    }
    return undefined;
}

export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
    const data = getResponseData(error);
    if (data?.message) return String(data.message);

    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return fallback;
}

export function getApiErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
    const data = getResponseData(error);
    if (data) {
        const nested = data.error;
        if (nested && typeof nested === 'object' && nested !== null && 'message' in nested) {
            return String((nested as { message: unknown }).message);
        }
        if (Array.isArray((nested as { details?: unknown })?.details)) {
            return 'خطأ في البيانات المرسلة';
        }
        if (data.message) return String(data.message);
    }
    return getErrorMessage(error, fallback);
}