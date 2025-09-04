export interface CostCenter {
  id: string;
  name: string;
  balance: number;
}

export interface MonthData {
  month: number;
  monthName: string;
  costCenters: CostCenter[];
}

export interface ReportData {
  year: number;
  type: string;
  months: MonthData[];
}

export interface TypeOption {
  label: string;
  value: string | undefined;
}

export interface YearOption {
  label: string;
  value: number;
}

export interface ExportParams {
  reportData: ReportData | null;
  costCenters: string[];
  selectedType: TypeOption;
  selectedYear: YearOption;
  getCostCenterBalance: (costCenter: string, monthIndex: number) => number;
  getCostCenterTotal: (costCenter: string) => number;
  getMonthTotal: (monthIndex: number) => number;
  getGrandTotal: () => number;
}