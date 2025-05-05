'use client';

import { useState, useEffect } from 'react';
import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';
import { api } from '@/service/api';
import { apiCall } from '@/helpers/apiHelper';
import { SkeletonLoader } from '@/components/skeleton/skeleton';
import { useFilter } from '@/app/contexts/filter-context';
import { moneyMask } from '@/utils/format';

const COLORS = {
   BG: {
      totalSpent: 'bg-[#28D775]',
   },
   FILL: {
      totalSpent: 'fill-[#28D775]',
   },
   STROKE: {
      totalSpent: 'stroke-[#28D775]',
   },
};

type PilotExpense = {
   pilotId: string;
   pilotName: string;
   totalSpent: number;
   totalSpentFormatted: string;
};

export default function PilotExepenses({ className }: { className?: string }) {
   const { period, startDate, endDate } = useFilter();

   const [loading, setLoading] = useState(true);
   const [data, setData] = useState<PilotExpense[]>([]);

   const fetchData = async () => {
      setLoading(true);

      try {
         const params: Record<string, string | undefined> = {};
         if (startDate && endDate) {
            params.startDate = startDate;
            params.endDate = endDate;
         } else if (period) {
            params.period = period;
         }

         const response = await apiCall(() => api.get('dashboard/general-manager/pilot-expenses', { params }));

         setData(response?.data || []);
      } catch (error) {
         console.error('Erro ao buscar dados de despesas dos pilotos:', error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
   }, [startDate, endDate, period]);

   return (
      <WidgetCard
         title="Gasto por Piloto (Mensal/Semanal)"
         titleClassName="text-gray-700 font-bold font-inter"
         headerClassName="items-center"
         className={cn('min-h-[28rem] @container', className)}
      >
         {loading ? <SkeletonLoader /> : <ChartContainer data={data} />}
      </WidgetCard>
   );
}

function ChartContainer({ data }: { data: PilotExpense[] }) {
   return (
      <div className="custom-scrollbar -mb-3 overflow-x-auto scroll-smooth pb-3">
         <div className="h-[24rem] w-full pt-6 @lg:pt-8">
            <ResponsiveContainer width="100%" height="100%" minWidth={900}>
               <ComposedChart
                  barGap={8}
                  data={data}
                  margin={{ left: -17, top: 20 }}
                  className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-xAxis.xAxis]:translate-y-2.5 [&_path.recharts-rectangle]:!stroke-none"
               >
                  <CartesianGrid vertical={false} strokeOpacity={0.435} strokeDasharray="8 10" />
                  <XAxis dataKey="pilotName" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(totalSpent) => `R$ ${Number(totalSpent).toFixed(2).toString().replace('.',',')}`} width={100} />
                  <Tooltip
                     cursor={false}
                     formatter={(value: number, name: string) => {
                        if (name === 'totalSpent') {
                           return [`${moneyMask(value.toString())}`, 'Total Gasto'];
                        }
                        return [value, name];
                     }}
                     wrapperStyle={{ backgroundColor: 'white', borderRadius: 8 }}
                     labelStyle={{ display: 'none' }}
                  />
                  <Bar
                     dataKey="totalSpent"
                     barSize={28}
                     radius={[4, 4, 0, 0]}
                     className={cn(COLORS.FILL['totalSpent'], COLORS.STROKE['totalSpent'])}
                  />
               </ComposedChart>
            </ResponsiveContainer>
         </div>
      </div>
   );
}
