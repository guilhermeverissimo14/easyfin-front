'use client';

import { useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import { useMedia } from '@core/hooks/use-media';
import useApi from '@/hooks/useApi';
import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/utils/format';
import { DatePicker } from '@core/ui/datepicker';
import { ptBR } from 'date-fns/locale';
import { format, subDays } from 'date-fns';
import { PiCalendarBlank, PiTrophy, PiMedal, PiStar } from 'react-icons/pi';

interface ChartDataPoint {
   label: string;
   value: number;
   date: string;
}

interface ChartCashFlow { 
   entries: number;
   exits: number;
}

interface DashboardChartsData {
   accountsPayableChart: ChartDataPoint[];
   accountsReceivableChart: ChartDataPoint[];
   cashFlowChart: ChartCashFlow;
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
   cashFlowChart: {
      entries: 101411,
      exits: 20000
   },
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

// Componente do Pódio para Centros de Custo
const CostCenterPodium = ({ data }: { data: { label: string; value: number }[] }) => {
   if (!data || data.length === 0) {
      return (
         <div className="mt-5 flex flex-col items-center justify-center h-[500px] text-center">
            <PiCalendarBlank className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
               Nenhum lançamento encontrado
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
               Não foram encontrados lançamentos financeiros no período selecionado. 
               Tente ajustar o filtro de datas ou verifique se há movimentações cadastradas.
            </p>
         </div>
      );
   }

   const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 5);
   const maxValue = sortedData[0]?.value || 0;

   const getPodiumHeight = (index: number) => {
      switch (index) {
         case 0: return 'h-32'; // 1º lugar - mais alto
         case 1: return 'h-24'; // 2º lugar
         case 2: return 'h-20'; // 3º lugar
         case 3: return 'h-16'; // 4º lugar
         case 4: return 'h-12'; // 5º lugar
         default: return 'h-12';
      }
   };

   const getPodiumColor = (index: number) => {
      switch (index) {
         case 0: return 'bg-gradient-to-t from-yellow-400 to-yellow-300 border-yellow-500'; // Ouro
         case 1: return 'bg-gradient-to-t from-gray-400 to-gray-300 border-gray-500'; // Prata
         case 2: return 'bg-gradient-to-t from-orange-400 to-orange-300 border-orange-500'; // Bronze
         case 3: return 'bg-gradient-to-t from-blue-400 to-blue-300 border-blue-500';
         case 4: return 'bg-gradient-to-t from-purple-400 to-purple-300 border-purple-500';
         default: return 'bg-gradient-to-t from-gray-400 to-gray-300 border-gray-500';
      }
   };

   const getIcon = (index: number) => {
      switch (index) {
         case 0: return <PiTrophy className="w-6 h-6 text-yellow-700" />;
         case 1: return <PiMedal className="w-6 h-6 text-gray-700" />;
         case 2: return <PiMedal className="w-6 h-6 text-orange-700" />;
         default: return <PiStar className="w-5 h-5 text-gray-600" />;
      }
   };

   const getPosition = (index: number) => {
      return `${index + 1}º`;
   };

   return (
      <div className="mt-5 lg:mt-7">
         <div className="flex flex-wrap gap-4 justify-center items-end min-h-[280px] mb-6">
            {sortedData.map((item, index) => {
               const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
               
               return (
                  <div key={item.label} className="flex flex-col items-center group">
                     {/* Posição e ícone */}
                     <div className="mb-2 flex flex-col items-center">
                        <div className="flex items-center gap-1 mb-1">
                           {getIcon(index)}
                           <span className="text-sm font-bold text-gray-700">
                              {getPosition(index)}
                           </span>
                        </div>
                     </div>
                     
                     {/* Barra do pódio */}
                     <div className="relative flex flex-col items-center">
                        <div 
                           className={`w-20 ${getPodiumHeight(index)} ${getPodiumColor(index)} border-2 rounded-t-lg shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl flex flex-col justify-center items-center relative overflow-hidden`}
                        >
                           {/* Efeito de brilho */}
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 group-hover:animate-pulse"></div>
                           
                           {/* Valor */}
                           <div className="text-xs font-bold text-gray-800 text-center px-1 relative z-10">
                              {formatCurrency(item.value)}
                           </div>
                           
                           {/* Porcentagem */}
                           <div className="text-xs text-gray-700 relative z-10">
                              {percentage.toFixed(0)}%
                           </div>
                        </div>
                        
                        {/* Base do pódio */}
                        <div className="w-20 h-4 bg-gray-600 rounded-b border-2 border-gray-700 shadow-md"></div>
                     </div>
                     
                     {/* Label do centro de custo */}
                     <div className="mt-3 text-center max-w-[100px]">
                        <p className="text-xs font-medium text-gray-700 leading-tight break-words">
                           {item.label}
                        </p>
                     </div>
                  </div>
               );
            })}
         </div>
         
         {/* Lista detalhada */}
         {/* <div className="bg-gray-50 rounded-lg p-4 bottom-8">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Ranking Detalhado</h4>
            <div className="space-y-2">
               {sortedData.map((item, index) => {
                  const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                  
                  return (
                     <div key={item.label} className="flex items-center justify-between py-2 px-3 bg-white rounded-md shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1">
                              {getIcon(index)}
                              <span className="text-sm font-bold text-gray-600 min-w-[24px]">
                                 {getPosition(index)}
                              </span>
                           </div>
                           <span className="text-sm font-medium text-gray-800">
                              {item.label}
                           </span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                 className={`h-2 rounded-full transition-all duration-500 ${
                                    index === 0 ? 'bg-yellow-400' :
                                    index === 1 ? 'bg-gray-400' :
                                    index === 2 ? 'bg-orange-400' :
                                    index === 3 ? 'bg-blue-400' : 'bg-purple-400'
                                 }`}
                                 style={{ width: `${percentage}%` }}
                              ></div>
                           </div>
                           <span className="text-sm font-semibold text-gray-900 min-w-[80px] text-right">
                              {formatCurrency(item.value)}
                           </span>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div> */}
      </div>
   );
};

export default function DashboardCharts() {
   const isTablet = useMedia('(max-width: 800px)', false);
   const [cashFlowStartDate, setCashFlowStartDate] = useState<Date | null>(subDays(new Date(), 30));
   const [cashFlowEndDate, setCashFlowEndDate] = useState<Date | null>(new Date());

   const buildCashFlowApiUrl = () => {
      let url = '/dashboard/charts';
      const params = new URLSearchParams();
      
      if (cashFlowStartDate) {
         params.append('startDate', format(cashFlowStartDate, 'yyyy-MM-dd'));
      }
      if (cashFlowEndDate) {
         params.append('endDate', format(cashFlowEndDate, 'yyyy-MM-dd'));
      }
      
      return params.toString() ? `${url}?${params.toString()}` : url;
   };

   const { data: apiData } = useApi<DashboardChartsData>(buildCashFlowApiUrl());
   const displayData = apiData;

   const cashFlowData = [
      { name: 'Entradas', value: displayData?.cashFlowChart.entries },
      { name: 'Saídas', value: displayData?.cashFlowChart.exits },
   ];

   const hasCashFlowData = displayData && (displayData?.cashFlowChart.entries > 0 || displayData?.cashFlowChart.exits > 0);

   const processedMonthlyData = displayData?.monthlyComparisonChart.revenue.map((revenueItem, index) => {
      const expenseItem = displayData?.monthlyComparisonChart.expenses[index];
      return {
         month: revenueItem.label,
         receita: revenueItem.value,
         despesa: expenseItem ? expenseItem.value : 0,
      };
   });

   const paymentStatusData = [
      { name: 'Pago', value: displayData?.paymentStatusChart.paid },
      { name: 'Pendente', value: displayData?.paymentStatusChart.pending },
      { name: 'Vencido', value: displayData?.paymentStatusChart.overdue },
   ];

   // Verificar se há dados de pagamento
   const hasPaymentData = displayData && (
      (displayData?.paymentStatusChart.paid || 0) > 0 ||
      (displayData?.paymentStatusChart.pending || 0) > 0 ||
      (displayData?.paymentStatusChart.overdue || 0) > 0
   );

   return (
      <div className="space-y-8">
         {/* Seção Visão Financeira - Todos os 4 gráficos */}
         <div className="space-y-6">
            {/* Header da Seção com Filtro */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
               <div>
                  <h2 className="text-xl font-bold text-gray-800">Visão Financeira</h2>
                  <p className="text-sm text-gray-600 mt-1">
                     Análise completa de receitas, despesas, fluxo de caixa, status de pagamentos e principais centros de custo
                  </p>
               </div>
               
               {/* Filtro de Período */}
               <div className="flex items-center gap-2 md:flex-row flex-col bg-gray-50 p-3 rounded-lg border">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Período:</span>
                  <DatePicker
                     selected={cashFlowStartDate}
                     onChange={(date) => setCashFlowStartDate(date)}
                     dateFormat="dd/MM/yyyy"
                     placeholderText="Data inicial"
                     inputProps={{
                        variant: 'outline',
                        inputClassName: 'h-9 px-2 text-sm [&_input]:text-ellipsis',
                        className: 'w-48'
                     }}
                     locale={ptBR}
                     maxDate={cashFlowEndDate || new Date()}
                  />
                  <span className="text-gray-400 text-sm">até</span>
                  <DatePicker
                     selected={cashFlowEndDate}
                     onChange={(date) => setCashFlowEndDate(date)}
                     dateFormat="dd/MM/yyyy"
                     placeholderText="Data final"
                     inputProps={{
                        variant: 'outline',
                        inputClassName: 'h-9 px-2 text-sm [&_input]:text-ellipsis',
                        className: 'w-48'
                     }}
                     locale={ptBR}
                     minDate={cashFlowStartDate || undefined}
                     maxDate={new Date()}
                  />
                  {(cashFlowStartDate || cashFlowEndDate) && (
                     <button
                        onClick={() => {
                           setCashFlowStartDate(null);
                           setCashFlowEndDate(null);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 underline whitespace-nowrap"
                     >
                        Limpar
                     </button>
                  )}
               </div>
            </div>

            {/* Grid 2x2 dos Gráficos */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
               {/* Receitas x Despesas */}
               <WidgetCard
                  title="Receitas x Despesas"
                  titleClassName="text-gray-700 font-bold font-inter"
                  headerClassName="items-center"
                  className="col-span-1"
               >
                  <div className="mt-5 aspect-[1366/640] w-full lg:mt-7">
                     <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                           data={processedMonthlyData}
                           margin={{
                              left: 60,
                              top: 40,
                              right: 10,
                              bottom: 10
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

               {/* Fluxo de Caixa */}
               <WidgetCard
                  title="Fluxo de Caixa"
                  titleClassName="text-gray-700 font-bold font-inter"
                  headerClassName="items-center"
                  className="col-span-1"
               >
                  <div className="mt-5 aspect-[1366/640] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        {!hasCashFlowData ? (
                           <div className="mt-5 flex flex-col items-center justify-center h-[400px] text-center">
                              <PiCalendarBlank className="w-12 h-12 text-gray-300 mb-3" />
                              <h3 className="text-base font-medium text-gray-600 mb-2">
                                 Nenhum lançamento encontrado
                              </h3>
                              <p className="text-xs text-gray-500 max-w-xs">
                                 Não foram encontrados lançamentos financeiros no período selecionado.
                              </p>
                           </div>
                        ) : (
                           <div className="mt-5 flex flex-col gap-4 lg:mt-7">
                              <div className="flex flex-col gap-2 lg:flex-row">
                                 <div className="relative h-[250px] w-full lg:w-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <PieChart>
                                          <Pie 
                                             data={cashFlowData} 
                                             cx="50%" 
                                             cy="50%" 
                                             innerRadius={50} 
                                             outerRadius={100} 
                                             paddingAngle={2} 
                                             dataKey="value"
                                          >
                                             {cashFlowData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                                             ))}
                                          </Pie>
                                          <Tooltip
                                             content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                   const data = payload[0].payload;
                                                   return (
                                                      <div className="rounded-lg border bg-white p-3 shadow-lg">
                                                         <p className="font-medium">{data.name}</p>
                                                         <p className="text-sm text-gray-600">{formatCurrency(data.value)}</p>
                                                      </div>
                                                   );
                                                }
                                                return null;
                                             }}
                                          />
                                       </PieChart>
                                    </ResponsiveContainer>
                                 </div>

                                 <div className="flex flex-1 flex-col justify-center gap-3">
                                    {cashFlowData.map((item, index) => (
                                       <div key={item.name} className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                             <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: index === 0 ? '#10B981' : '#EF4444' }}
                                             />
                                             <span className="text-sm font-medium text-gray-700">{item.name}</span>
                                          </div>
                                          <div className="text-right">
                                             <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.value)}</p>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        )}
                     </ResponsiveContainer>
                  </div>
               </WidgetCard>

               {/* Status de Pagamentos */}
               <WidgetCard
                  title="Status de Pagamentos"
                  titleClassName="text-gray-700 font-bold font-inter"
                  headerClassName="items-center"
                  className="col-span-1"
               >
                  <div className="mt-5 flex flex-col gap-6 lg:mt-7">
                     {hasPaymentData ? (
                        <div className="flex flex-col gap-4 lg:flex-row">
                           <div className="relative h-[250px] w-full lg:w-[250px]">
                              <ResponsiveContainer width="100%" height="100%">
                                 <PieChart>
                                    <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={2} dataKey="value">
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

                           <div className="flex flex-1 flex-col justify-center gap-3">
                              {paymentStatusData.map((item, index) => (
                                 <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
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
                     ) : (
                        <div className="flex flex-col items-center justify-center h-[250px] text-center">
                           <PiCalendarBlank className="w-12 h-12 text-gray-300 mb-3" />
                           <h3 className="text-base font-medium text-gray-600 mb-2">
                              Nenhum pagamento encontrado
                           </h3>
                           <p className="text-xs text-gray-500 max-w-xs">
                              Não foram encontrados pagamentos no período selecionado.
                           </p>
                        </div>
                     )}
                  </div>
               </WidgetCard>

               {/* Principais Centros de Custo */}
               <WidgetCard
                  title="Principais Centros de Custo"
                  titleClassName="text-gray-700 font-bold font-inter"
                  headerClassName="items-center"
                  className="col-span-1"
               >
                  <div className="mt-5 aspect-[1060/400] w-full lg:mt-7">
                     <ResponsiveContainer width="100%" height="100%">
                        <CostCenterPodium data={displayData?.topCostCenters ?? []} />
                     </ResponsiveContainer>
                  </div>
               </WidgetCard>
            </div>
         </div>
      </div>
   );
}
