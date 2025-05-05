'use client';

import { useEffect, useState } from 'react';
import { Box, Flex, Text } from 'rizzui';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import cn from '@core/utils/class-names';
import WidgetCard from '@core/components/cards/widget-card';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { SpendingsTypePilot, userType } from '@/types';
import { SkeletonLoader } from '@/components/skeleton/skeleton';
import { useFilter } from '@/app/contexts/filter-context';



const COLORS = ['#2B7F75', '#FFD66B', '#64CCC5', '#176B87'];

const calculatePercentage = (part: number, total: number) =>
  ((part / total) * 100).toFixed(2);


export default function PilotSpending({ className }: { className?: string }) {

  const { period, startDate, endDate } = useFilter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [data, setData] = useState<SpendingsTypePilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [valueSum, setValueSum] = useState<number>();

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
        api.get('dashboard/pilot/spendings', { params })
      );
      setValueSum(response?.data?.totalSpendings);
      setData(response?.data?.spendings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }

  }

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    getProductionPilot();
  }, [period, startDate, endDate]);

  return (
    <WidgetCard
      title="Total gasto"
      className={cn('@container', className)}
      headerClassName="mb-6 lg:mb-0"
    >
      {loading ? <SkeletonLoader /> : (
        <>
          <Box className="relative mx-auto size-[290px] @sm:size-[340px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              className="relative z-10"
            >
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  dataKey="value"
                  innerRadius="42%"
                  outerRadius="70%"
                  fill="#8884d8"
                  paddingAngle={4}
                  data={data}
                  onMouseEnter={onPieEnter}
                  activeIndex={activeIndex}
                  cornerRadius={6}
                  // label
                >
                  {data?.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <Box className="absolute inset-24 flex flex-col items-center justify-center rounded-full bg-white shadow-[0px_4px_20px_0px_#00000029] @sm:inset-28 dark:bg-gray-200">
              <Text className="text-center text-gray-500">Valor total</Text>
              <Text className="text-xl font-semibold dark:text-white">
                {valueSum?.toFixed(2)?.toString().replace(".", ",")}
              </Text>
            </Box>
          </Box>

          <Flex justify="center" className="flex-wrap @lg:gap-8">
            {data?.map((item, index) => (
              <Box key={item.expense}>
                <Flex align="center" gap="1">
                  <span
                    className="me-2 h-2.5 w-3.5 flex-shrink-0"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <Text as="span" className="whitespace-nowrap">
                    {item.expense}
                  </Text>
                </Flex>
                <Text as="p" className="ms-[26px] font-medium">
                  {calculatePercentage(item.value, Number(valueSum) || 0)}%
                </Text>
              </Box>
            ))}
          </Flex>
        </>
      )}
    </WidgetCard>
  );
}
