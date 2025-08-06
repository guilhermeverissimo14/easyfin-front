'use client';

import { useState } from 'react';
import MetricCard from '@core/components/cards/metric-card';
import useApi from '@/hooks/useApi';
import { formatCurrency } from '@/utils/format';
import { PiUsers, PiFactory, PiTrendDown, PiCalendar, PiArrowUp, PiArrowDown } from 'react-icons/pi';

interface OverviewData {
   totalCustomers: number;
   totalSuppliers: number;
   totalInvoices: number;
   totalAccountsPayable: number;
   totalAccountsReceivable: number;
   totalOverduePayable: number;
   totalOverdueReceivable: number;
   totalPaidThisMonth: number;
   totalReceivedThisMonth: number;
   cashFlowBalance: number;
   pendingInvoices: number;
   monthlyRevenue: number;
   monthlyExpenses: number;
}

const mockData: OverviewData = {
   totalCustomers: 0,
   totalSuppliers: 0,
   totalInvoices: 0,
   totalAccountsPayable: 0,
   totalAccountsReceivable: 0,
   totalOverduePayable: 0,
   totalOverdueReceivable: 0,
   totalPaidThisMonth: 0,
   totalReceivedThisMonth: 0,
   cashFlowBalance: 0,
   pendingInvoices: 0,
   monthlyRevenue: 0,
   monthlyExpenses: 0,
};

export default function DashboardOverview() {
   const [data, setData] = useState<OverviewData>(mockData);

   const { data: apiData, loading, error } = useApi<OverviewData>('/dashboard/overview');
   const displayData = apiData || mockData;

   return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
         <MetricCard
            title="Total de Clientes"
            metric={displayData.totalCustomers.toLocaleString()}
            icon={<PiUsers className="h-6 w-6 text-blue-600" />}
            iconClassName="bg-blue-100"
            className="bg-blue-300/10"
         />

         <MetricCard
            title="Total de Fornecedores"
            metric={displayData.totalSuppliers.toLocaleString()}
            icon={<PiFactory className="h-6 w-6 text-green-600" />}
            iconClassName="bg-green-100"
            className="bg-green-300/10"
         />

         <MetricCard
            title="Contas a Pagar"
            metric={formatCurrency(displayData.totalAccountsPayable)}
            icon={<PiArrowDown className="h-6 w-6 text-red-600" />}
            iconClassName="bg-red-100"
            className="bg-red-300/10"
         />

         <MetricCard
            title="Contas a Receber"
            metric={formatCurrency(displayData.totalAccountsReceivable)}
            icon={<PiArrowUp className="h-6 w-6 text-green-600" />}
            iconClassName="bg-green-100"
            className="bg-green-300/10"
         />

         <MetricCard
            title="Vencidas a Pagar"
            metric={formatCurrency(displayData.totalOverduePayable)}
            icon={<PiTrendDown className="h-6 w-6 text-red-600" />}
            iconClassName="bg-red-100"
            className="bg-red-300/10"
         />

         <MetricCard
            title="Vencidas a Receber"
            metric={formatCurrency(displayData.totalOverdueReceivable)}
            icon={<PiTrendDown className="h-6 w-6 text-orange-600" />}
            iconClassName="bg-orange-100"
            className="bg-orange-300/10"
         />

         <MetricCard
            title="Pago Este Mês"
            metric={formatCurrency(displayData.totalPaidThisMonth)}
            icon={<PiCalendar className="h-6 w-6 text-blue-600" />}
            iconClassName="bg-blue-100"
            className="bg-blue-300/10"
         />

         <MetricCard
            title="Recebido Este Mês"
            metric={formatCurrency(displayData.totalReceivedThisMonth)}
            icon={<PiCalendar className="h-6 w-6 text-green-600" />}
            iconClassName="bg-green-100"
            className="bg-green-300/10"
         />
      </div>
   );
}
