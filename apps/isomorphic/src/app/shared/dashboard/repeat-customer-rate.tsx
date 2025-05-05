'use client';

import WidgetCard from '@core/components/cards/widget-card';
import { useMedia } from '@core/hooks/use-media';
import { DatePicker } from '@core/ui/datepicker';
import { useState, useEffect } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Text } from 'rizzui';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '@/service/api';
import { apiCall } from '@/helpers/apiHelper';
import { SkeletonLoader } from '@/components/skeleton/skeleton';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';

interface ReceivedData {
  month: string;
  totalRecebido: number;
}

export default function RevenueChart({
  className,
}: {
  className?: string;
}) {
  const isTablet = useMedia('(max-width: 820px)', false);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [data, setData] = useState<ReceivedData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchData = async (selectedYear: number) => {
    setLoading(true);
    try {
      const response = await apiCall(() =>
        api.get('/dashboard/general-manager/accounts-received', {
          params: { year: selectedYear }
        })
      );
      
      if (response?.data) {
        const formattedData = response.data.map((item: any) => ({
          month: format(new Date(selectedYear, item.month - 1, 1), 'MMM', { locale: ptBR }),
          totalRecebido: item.totalRecebido,
        }));
        
        setData(formattedData);
      }
    } catch (error) {
      // console.error('Erro ao buscar dados de recebimentos:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData(year);
  }, []);
  
  return (
    <WidgetCard
      title={'Recebimento de contratos'}
      description={
        <Text as="span" className="text-gray-500 mt-1.5">
          Total recebido por mês
        </Text>
      }
      action={
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => {
            setStartDate(date);
            
            if (date) {
              const selectedYear = date.getFullYear();
              setYear(selectedYear); // Atualiza o estado do ano
              fetchData(selectedYear);
            }
          }}
          dateFormat="yyyy"
          placeholderText="Selecione o Ano"
          showYearPicker
          inputProps={{ variant: 'text', inputClassName: 'p-0 px-1 h-auto' }}
          popperPlacement="bottom-end"
          className="w-[120px]"
        />
      }
      className={className}
    >
      {loading ? (
        <div className="h-[480px] w-full flex items-center justify-center">
          <SkeletonLoader />
        </div>
      ) : (
        <div className="custom-scrollbar overflow-x-auto scroll-smooth">
          <div className="h-[480px] w-full pt-9">
            {data.length > 0 ? (
              <ResponsiveContainer
                width="100%"
                height="100%"
                {...(isTablet && { minWidth: '700px' })}
              >
                <AreaChart
                  data={data}
                  margin={{
                    left: -16,
                  }}
                  className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-500 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
                >
                  <defs>
                    <linearGradient id="totalRecebido" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d1fae5" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 10" strokeOpacity={0.435} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    className=" "
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `R$ ${value.toLocaleString()}`}
                    className=" "
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    formatter={(value: number) =>
                      `R$ ${value.toLocaleString()}`
                    }
                  />
                  <Area
                    type="natural"
                    dataKey="totalRecebido"
                    stroke="#10b981"
                    strokeWidth={2.3}
                    fillOpacity={1}
                    fill="url(#totalRecebido)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Text className="text-gray-500">Nenhum dado disponível para o ano {year}</Text>
              </div>
            )}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}