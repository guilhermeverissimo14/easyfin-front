'use client';

import { useState } from 'react';
import MetricCard from '@core/components/cards/metric-card';
import useApi from '@/hooks/useApi';
import { formatCurrency } from '@/utils/format';
import { PiUsers, PiFactory, PiTrendDown, PiCalendar, PiArrowUp, PiArrowDown } from 'react-icons/pi';
import { DatePicker } from '@core/ui/datepicker';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

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
   const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);

   // Build API URL with month parameter
   const buildApiUrl = () => {
      let url = '/dashboard/overview';
      
      if (selectedMonth) {
         const monthParam = format(selectedMonth, 'MM/yyyy');
         url += `?month=${monthParam}`;
      }
      
      return url;
   };

   const { data: apiData, loading, error } = useApi<OverviewData>(buildApiUrl());
   const displayData = apiData || mockData;

   return (
      <div className="space-y-6">
         {/* Filter Section */}
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-xl font-semibold text-gray-900">Visão Geral</h2>
               <p className="text-sm text-gray-600">
                  {selectedMonth 
                     ? `Dados de ${format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}`
                     : 'Dados do período atual'
                  }
               </p>
            </div>
            
            <div className="flex items-center gap-2 md:flex-row flex-col bg-gray-50 p-3 rounded-lg border">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Período:</span>
               <div className="flex items-center gap-3">
                  <DatePicker
                     selected={selectedMonth}
                     onChange={(date) => setSelectedMonth(date)}
                     dateFormat="MM/yyyy"
                     showMonthYearPicker
                     placeholderText="Selecionar mês"
                     inputProps={{
                        variant: 'outline',
                        inputClassName: 'h-10 px-3 text-sm [&_input]:text-ellipsis',
                        className: 'w-56'
                     }}
                     locale={ptBR}
                     maxDate={new Date()}
                  />
                  
                  {selectedMonth && (
                     <button
                        onClick={() => setSelectedMonth(null)}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                     >
                        Limpar filtro
                     </button>
                  )}
               </div>
            </div>
         </div>

         {/* Metrics Grid */}
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
      </div>
   );
}
