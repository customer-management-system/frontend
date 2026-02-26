import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-fggt.onrender.com/api/v1';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
    };
};

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
        let url = `${API_URL}/dashboard/financials/cash-flow`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await axios.get<CashFlowResponse>(url, { headers: getHeaders() });
        return response.data;
    },

    getKPIs: async (startDate?: string, endDate?: string) => {
        let url = `${API_URL}/dashboard/kpis`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await axios.get<KPIsResponse>(url, { headers: getHeaders() });
        return response.data;
    },

    getAlerts: async (startDate?: string, endDate?: string) => {
        let url = `${API_URL}/dashboard/operations/alerts`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;

        const response = await axios.get<AlertsResponse>(url, { headers: getHeaders() });
        return response.data;
    },

    getCustomersDebt: async (limit: number = 10) => {
        const url = `${API_URL}/dashboard/customers/debt?limit=${limit}`;
        const response = await axios.get<CustomersDebtResponse>(url, { headers: getHeaders() });
        return response.data;
    },

    getTopProducts: async (startDate?: string, endDate?: string, limit: number = 10) => {
        let url = `${API_URL}/dashboard/products/top-performers?limit=${limit}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        const response = await axios.get<TopProductsResponse>(url, { headers: getHeaders() });
        return response.data;
    },
};
