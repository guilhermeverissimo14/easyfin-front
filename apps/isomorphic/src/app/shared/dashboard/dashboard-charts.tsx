'use client';

import { useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import DropdownAction from '@core/components/charts/dropdown-action';
import { useMedia } from '@core/hooks/use-media';
import useApi from '@/hooks/useApi';
import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/utils/format';

interface ChartDataPoint {
   label: string;
   value: number;
   date: string;
}

interface DashboardChartsData {
   accountsPayableChart: ChartDataPoint[];
   accountsReceivableChart: ChartDataPoint[];
   cashFlowChart: ChartDataPoint[];
   monthlyComparisonChart: {
      revenue: ChartDataPoint[];
      expenses: ChartDataPoint[];
   };
   paymentStatusChart: {
      paid: number;
      pending: number;
      overdue: number;
   };
   topCostCenters: {
      label: string;
      value: number;
   }[];
}

// Mock data matching API structure
const mockData: DashboardChartsData = {
   accountsPayableChart: [
      { label: 'ago. de 2025', value: 0, date: '2025-08-05T11:41:58.000Z' },
      { label: 'ago. de 2025', value: 0, date: '2025-08-05T17:51:57.942Z' },
   ],
   accountsReceivableChart: [{ label: 'ago. de 2025', value: 500, date: '2025-08-05T18:25:52.000Z' }],
   cashFlowChart: [
      { label: 'ago. de 2025 - Saída', value: 0, date: '2025-08-04T21:18:41.825Z' },
      { label: 'ago. de 2025 - Saída', value: 0, date: '2025-08-04T21:49:03.372Z' },
      { label: 'ago. de 2025 - Entrada', value: 0, date: '2025-08-05T00:48:39.161Z' },
   ],
   monthlyComparisonChart: {
      revenue: [
         { label: 'jul. de 2025', value: 0, date: '2025-07-05T06:00:00.000Z' },
         { label: 'jul. de 2025', value: 0, date: '2025-07-22T00:55:14.940Z' },
         { label: 'ago. de 2025', value: 0, date: '2025-08-05T00:48:39.161Z' },
      ],
      expenses: [
         { label: 'jul. de 2025', value: 0, date: '2025-07-21T21:56:24.742Z' },
         { label: 'jul. de 2025', value: 0, date: '2025-07-27T22:06:15.000Z' },
         { label: 'ago. de 2025', value: 0, date: '2025-08-04T21:18:41.825Z' },
         { label: 'ago. de 2025', value: 0, date: '2025-08-04T21:49:03.372Z' },
      ],
   },
   paymentStatusChart: {
      paid: 3,
      pending: 1,
      overdue: 1,
   },
   topCostCenters: [
      { label: 'Despesas Bancárias', value: 3400 },
      { label: 'Despesas com Água', value: 1000 },
   ],
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const COLORS_PAYMENT_STATUS = ['#10B981', '#F59E0B', '#EF4444'];

const viewOptions = [
   { value: 'monthly', label: 'Mensal' },
   { value: 'quarterly', label: 'Trimestral' },
   { value: 'yearly', label: 'Anual' },
];

export default function DashboardCharts() {
   const isTablet = useMedia('(max-width: 800px)', false);
   const [viewType, setViewType] = useState('monthly');

   const { data: apiData, loading, error } = useApi<DashboardChartsData>('/dashboard/charts');
   const displayData = apiData || mockData;

   function handleChange(selectedViewType: string) {
      setViewType(selectedViewType);
   }

   // Process cash flow data to separate entrada and saida
   const processedCashFlowData = displayData.cashFlowChart.reduce((acc: any[], item) => {
      const month = item.label.split(' - ')[0];
      const type = item.label.includes('Entrada') ? 'entrada' : 'saida';

      let existingMonth = acc.find((m) => m.month === month);
      if (!existingMonth) {
         existingMonth = { month, entrada: 0, saida: 0 };
         acc.push(existingMonth);
      }

      existingMonth[type] += item.value;
      return acc;
   }, []);

   // Process monthly comparison data
   const processedMonthlyData = displayData.monthlyComparisonChart.revenue.map((revenueItem, index) => {
      const expenseItem = displayData.monthlyComparisonChart.expenses[index];
      return {
         month: revenueItem.label,
         receita: revenueItem.value,
         despesa: expenseItem ? expenseItem.value : 0,
      };
   });

   // Process payment status data for pie chart
   const paymentStatusData = [
      { name: 'Pago', value: displayData.paymentStatusChart.paid },
      { name: 'Pendente', value: displayData.paymentStatusChart.pending },
      { name: 'Vencido', value: displayData.paymentStatusChart.overdue },
   ];

   return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
         {/* Revenue vs Expenses Chart */}
         <WidgetCard
            title="Receita vs Despesas"
            titleClassName="text-gray-700 font-bold font-inter"
            headerClassName="items-center"
            action={<DropdownAction className="rounded-md border" options={viewOptions} onChange={handleChange} dropdownClassName="!z-0" />}
            className="col-span-full lg:col-span-1"
         >
            <div className="mt-5 aspect-[1060/640] w-full lg:mt-7">
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                     data={processedMonthlyData}
                     margin={{
                        left: -5,
                     }}
                     className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
                  >
                     <CartesianGrid vertical={false} strokeOpacity={0.435} strokeDasharray="8 10" />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} />
                     <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$').slice(0, -3) + 'k'}
                     />
                     <Tooltip content={<CustomTooltip />} />
                     <Bar dataKey="receita" fill="#3aa682" stroke="#3aa682" strokeWidth={1} radius={[2, 2, 0, 0]} name="Receita" />
                     <Bar dataKey="despesa" fill="#cf5959" stroke="#cf5959" strokeWidth={1} radius={[2, 2, 0, 0]} name="Despesa" />
                  </ComposedChart>
               </ResponsiveContainer>
            </div>
         </WidgetCard>

         {/* Cash Flow Chart */}
         <WidgetCard
            title="Fluxo de Caixa"
            titleClassName="text-gray-700 font-bold font-inter"
            headerClassName="items-center"
            className="col-span-full lg:col-span-1"
         >
            <div className="mt-5 aspect-[1060/640] w-full lg:mt-7">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                     data={processedCashFlowData}
                     margin={{
                        left: -5,
                     }}
                     className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500"
                  >
                     <defs>
                        <linearGradient id="entrada" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                           <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="saida" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                           <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
                        </linearGradient>
                     </defs>
                     <CartesianGrid vertical={false} strokeOpacity={0.435} strokeDasharray="8 10" />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} />
                     <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => formatCurrency(value).replace('R$', 'R$').slice(0, -3) + 'k'}
                     />
                     <Tooltip content={<CustomTooltip />} />
                     <Area type="monotone" dataKey="entrada" stroke="#10B981" fillOpacity={1} fill="url(#entrada)" strokeWidth={2} name="Entrada" />
                     <Area type="monotone" dataKey="saida" stroke="#EF4444" fillOpacity={1} fill="url(#saida)" strokeWidth={2} name="Saída" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </WidgetCard>

         {/* Expenses by Category */}
         <WidgetCard
            title="Status de Pagamentos"
            titleClassName="text-gray-700 font-bold font-inter"
            headerClassName="items-center"
            className="col-span"
         >
            <div className="mt-5 flex flex-col gap-6 lg:mt-7">
               <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="relative h-[300px] w-full lg:w-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="value">
                              {paymentStatusData.map((entry, index) => (
                                 <Cell key={`cell-${index}`} fill={COLORS_PAYMENT_STATUS[index % COLORS_PAYMENT_STATUS.length]} />
                              ))}
                           </Pie>
                           <Tooltip
                              content={({ active, payload }) => {
                                 if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                       <div className="rounded-lg border bg-white p-3 shadow-lg">
                                          <p className="font-medium">{data.name}</p>
                                          <p className="text-sm text-gray-600">{data.value} itens</p>
                                       </div>
                                    );
                                 }
                                 return null;
                              }}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                  </div>

                  <div className="flex flex-1 flex-col justify-center gap-4">
                     {paymentStatusData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div
                                 className="h-3 w-3 rounded-full"
                                 style={{ backgroundColor: COLORS_PAYMENT_STATUS[index % COLORS_PAYMENT_STATUS.length] }}
                              />
                              <span className="text-sm font-medium text-gray-700">{item.name}</span>
                           </div>
                           <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">{item.value} itens</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </WidgetCard>

         {/* Top Cost Centers */}
         <WidgetCard
            title="Principais Centros de Custo"
            titleClassName="text-gray-700 font-bold font-inter"
            headerClassName="items-center"
            className="col-span"
         >
            <div className="mt-5 aspect-[1060/400] w-full lg:mt-7">
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                     data={displayData.topCostCenters}
                     layout="horizontal"
                     margin={{
                        left: 20,
                        right: 20,
                        top: 20,
                        bottom: 20,
                     }}
                     className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500"
                  >
                     <CartesianGrid horizontal={false} strokeOpacity={0.435} strokeDasharray="8 10" />
                     <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(value) => formatCurrency(value)} />
                     <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={120} />
                     <Tooltip
                        content={({ active, payload }) => {
                           if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                 <div className="rounded-lg border bg-white p-3 shadow-lg">
                                    <p className="font-medium">{data.label}</p>
                                    <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
                                 </div>
                              );
                           }
                           return null;
                        }}
                     />
                     <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Valor" />
                  </ComposedChart>
               </ResponsiveContainer>
            </div>
         </WidgetCard>
      </div>
   );
}
