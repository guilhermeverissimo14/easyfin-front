'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  ComposedChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { Title } from 'rizzui/typography';

import cn from '@core/utils/class-names';
import WidgetCard from '@core/components/cards/widget-card';
import { formatNumber } from '@core/utils/format-number';
import { api } from '@/service/api';
import { apiCall } from '@/helpers/apiHelper';
import { SkeletonLoader } from '@/components/skeleton/skeleton';
import { useFilter } from '@/app/contexts/filter-context';
interface TeamExpenseData {
  fill: string;
  localManagerId: string;
  localManagerName: string;
  qtyPilots: number;
  totalSpent: number;
  totalSpentFormatted: string;
}

export default function TeamExpenses({ className }: { className?: string }) {

  const { period, startDate, endDate } = useFilter(); 

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeamExpenseData[]>([]);

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

      const response = await apiCall(() =>
        api.get('dashboard/general-manager/team-expenses', { params })
      );
      setData(response?.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados de equipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, period]);

  return (
    <WidgetCard
      title="Gasto por Equipe"
      titleClassName="text-gray-700 font-bold font-inter"
      headerClassName="items-center"
      className={cn('@container', className)}
    >
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          <div className="mb-4 mt-2 flex items-center gap-2 @lg:mt-1">
            <Title as="h2" className="font-inter font-bold">
              {data.reduce((acc, item) => acc + item.totalSpent, 0).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </Title>
          </div>
          <div className="custom-scrollbar overflow-x-auto scroll-smooth">
            <div className="h-[20rem] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  layout="vertical"
                  data={data.map((item) => ({
                    name: item.localManagerName,
                    total: item.totalSpent,
                    fill: item.fill,
                  }))}
                  className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-300 dark:[&_.recharts-cartesian-axis-tick-value]:fill-gray-700 [&_path.recharts-rectangle]:!stroke-none"
                >
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    hide={true}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: 13, fontWeight: 500 }}
                    width={150}
                    className="rtl:-translate-x-24 [&_.recharts-text]:fill-gray-700"
                  />
                  <Bar dataKey="total" barSize={28} radius={[50, 50, 50, 50]}>
                    <LabelList
                      position="right"
                      dataKey="total"
                      content={<CustomizedLabel />}
                    />
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </WidgetCard>
  );
}

function CustomizedLabel(props: any) {
  const { x, y, width, height, value } = props;
  const radius = 10;

  return (
    <g>
      <rect
        x={x + width - 44}
        y={y + 4}
        width={40}
        height={height - 8}
        rx={radius}
        fill="#ffffff"
      />
      <text
        y={y + 1 + height / 2}
        x={x + width - 24}
        fill="currentColor"
        className="text-[13px] font-medium text-gray-800 dark:text-gray-200"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {formatNumber(value)}
      </text>
    </g>
  );
}