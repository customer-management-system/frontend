import api from '@/lib/axios';

export interface CashFlowTimelineEntry {
    date: string;
    revenue: number;
    cash: number;
}

export interface PaymentMethodEntry {
    method: string;
    amount: number;
}

export interface CashFlowResponse {
    success: boolean;
    data: {
        timeline: CashFlowTimelineEntry[];
        paymentMethods: PaymentMethodEntry[];
    };
}

export interface KPIsResponse {
    success: boolean;
    data: {
        grossRevenue: number;
        cashCollected: number;
        outstandingDebt: number;
        totalDiscounts: number;
        activeCustomers: number;
        period: {
            startDate: string;
            endDate: string;
        };
    };
}

export interface SuspiciousActivityLog {
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    user: string;
    date: string;
}

export interface AlertsResponse {
    success: boolean;
    data: {
        riskMetrics: {
            reversedOrVoidedPaymentsCount: number;
            deletedOrdersCount: number;
            modifiedOrdersCount: number;
        };
        recentSuspiciousActivityLogs: SuspiciousActivityLog[];
    };
}

export interface DebtorEntry {
    customerId: number;
    name: string;
    phone: string;
    totalOrders: number;
    totalPaid: number;
    outstandingBalance: number;
    lastPaymentDate: string | null;
    daysSinceLastPayment: number;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface CustomersDebtResponse {
    success: boolean;
    data: {
        topDebtors: DebtorEntry[];
        severelyOverdue: DebtorEntry[];
        regularGoodPayers: DebtorEntry[];
    };
}

export interface TopProductEntry {
    productId: number;
    name: string;
    sku: string;
    totalQuantitySold: number;
    totalRevenue: number;
    totalDiscountsGivenOnItem: number;
}

export interface TopProductsResponse {
    success: boolean;
    data: TopProductEntry[];
}

export const dashboardService = {
    getCashFlow: async (startDate?: string, endDate?: string) => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get<CashFlowResponse>('/dashboard/financials/cash-flow', { params });
        return response.data;
    },

    getKPIs: async (startDate?: string, endDate?: string) => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get<KPIsResponse>('/dashboard/kpis', { params });
        return response.data;
    },

    getAlerts: async (startDate?: string, endDate?: string) => {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get<AlertsResponse>('/dashboard/operations/alerts', { params });
        return response.data;
    },

    getCustomersDebt: async (limit: number = 10) => {
        const response = await api.get<CustomersDebtResponse>('/dashboard/customers/debt', { params: { limit } });
        return response.data;
    },

    getTopProducts: async (startDate?: string, endDate?: string, limit: number = 10) => {
        const params: Record<string, string | number> = { limit };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get<TopProductsResponse>('/dashboard/products/top-performers', { params });
        return response.data;
    },
};
