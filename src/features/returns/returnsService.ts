import api from "@/lib/axios";
import { CreateReturnRequest, ReturnData, ReturnItem } from "./schema";

function normalizeReturnItem(item: Record<string, unknown> & {
    product?: { id?: number; name?: string };
    product_id?: number;
    product_name?: string;
    unit_price?: string | number;
    unitPrice?: string | number;
}): ReturnItem {
    return {
        id: Number(item.id),
        product_id: Number(item.product_id ?? item.product?.id ?? 0),
        product_name: String(item.product_name ?? item.product?.name ?? ''),
        quantity: Number(item.quantity),
        unit_price: item.unit_price ?? item.unitPrice ?? 0,
        subtotal: (item.subtotal as string | number) ?? 0,
    };
}

function normalizeReturn(record: Record<string, unknown> & {
    customer?: { id?: number };
    customer_id?: number;
    items?: unknown[];
}): ReturnData {
    return {
        ...(record as unknown as ReturnData),
        customer_id: Number(record.customer_id ?? record.customer?.id ?? 0),
        items: (record.items ?? []).map((item) =>
            normalizeReturnItem(item as Parameters<typeof normalizeReturnItem>[0]),
        ),
    };
}

export const returnsService = {
    create: async (data: CreateReturnRequest) => {
        const response = await api.post('/returns', {
            customer_id: data.customer_id,
            notes: data.notes,
            items: data.items.map(({ product_id, quantity, unit_price }) => ({
                product_id,
                quantity,
                unit_price,
            })),
        });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get(`/returns/${id}`);
        if (response.data?.success && response.data.data) {
            return {
                ...response.data,
                data: normalizeReturn(response.data.data),
            };
        }
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/returns/${id}`);
        return response.data;
    },

    restore: async (id: number) => {
        const response = await api.patch(`/returns/${id}/restore`, {});
        return response.data;
    },
};
