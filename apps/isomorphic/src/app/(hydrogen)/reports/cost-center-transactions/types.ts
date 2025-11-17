export interface Transaction {
    id: string;
    date: string;
    historic: string;
    description: string;
    value: number;
    bankAccountId: string;
    documentNumber: string;
}

export interface CostCenter {
    id: string;
    name: string;
}

export interface Period {
    startDate: string;
    endDate: string;
}

export interface Totals {
    totalRevenue: number;
    totalExpenses: number;
    net: number;
}

export interface CostCenterTransactionsReport {
    costCenter: CostCenter;
    period: Period;
    revenues: Transaction[];
    expenses: Transaction[];
    totals: Totals;
}

export interface CostCenterOption {
    label: string;
    value: string;
}
