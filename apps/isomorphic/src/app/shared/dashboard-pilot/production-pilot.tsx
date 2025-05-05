'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { DashProductionPilot, userType } from '@/types';
import WidgetCard from '@core/components/cards/widget-card';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';
import cn from '@core/utils/class-names';
import { SkeletonLoader } from '@/components/skeleton/skeleton';
import { Box } from 'rizzui/box';
import { useFilter } from '@/app/contexts/filter-context';


export default function ProductionPilot({
  className,
}: {
  className?: string;
}) {

  const { period, startDate, endDate } = useFilter();

  const [data, setData] = useState<DashProductionPilot[]>([]);
  const [loading, setLoading] = useState(true);

  const sessionUser: userType = JSON.parse(localStorage.getItem('eas:user') || '{}') as userType;

  const getProductionPilot = async () => {
    setLoading(true);
    try {

      const params: Record<string, string | undefined> = {
        pilotId: sessionUser?.id,
      };

      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (period) {
        params.period = period;
      }

      const response = await apiCall(() =>
        api.get('dashboard/pilot/production', { params })
      );
     
      setData(response?.data || []);
    } catch (error) {

    } finally {
      setLoading(false);
    }

  }

  function getActiveIndex() {
    let thisMonthName = new Date().toLocaleString('default', { month: 'short' });
    let activeIndex = data.findIndex(
      (data) => data.day === thisMonthName
    );

    return activeIndex;
  }

  useEffect(() => {
    getProductionPilot();
  }, [period, startDate, endDate]);

  function renderCustomizedLabel(props: any) {
    const { x, y, index } = props;
    let isActive = index === getActiveIndex();

    return (
      <g>
        <defs>
          <filter id="shadow">
            <feDropShadow dx="0.2" dy="0.4" stdDeviation="0.2" />
          </filter>
        </defs>
        <rect
          x={x - 8}
          y={y - 4}
          width="40"
          height="4"
          rx="4"
          fill={isActive ? '#2CDDC7' : '#59A7FF'}
          filter="url(#shadow)"
        />
      </g>
    );
  }

  return (
    <WidgetCard
      className={cn('@container', className)}
      title="Produção do piloto"
    >
      {loading ? <SkeletonLoader /> : (
        <>
          <div className="custom-scrollbar overflow-x-auto scroll-smooth w-full">
            <Box className="mt-[22px] h-[350px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={600}>
                <BarChart
                  data={data}
                  margin={{
                  top: 22,
                  left: -15,
                  }}
                  className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-cartesian-grid-vertical]:opacity-0"
                >
                  <CartesianGrid strokeDasharray="1 0" vertical={false} />
                  <XAxis dataKey={period === 'yearly' ? 'label' : period === 'weekly' ? 'day' : 'month'} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip formattedNumber />} />
                  <Bar
                  barSize={24}
                  fill={'#59A7FF'}
                  dataKey="hectaresWorked"
                  radius={[0, 0, 6, 6]}
                  activeBar={<Rectangle fill="#2CDDC7" stroke="#2CDDC7" />}
                  activeIndex={getActiveIndex()}
                  >
                  <LabelList dataKey="hectaresWorked" content={renderCustomizedLabel} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </div>
        </>
      )}
    </WidgetCard>
  );
}

