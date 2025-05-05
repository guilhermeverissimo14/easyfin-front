'use client';

import { useEffect, useState } from 'react';
import { Button } from 'rizzui';
import cn from '@core/utils/class-names';
import { useScrollableSlider } from '@core/hooks/use-scrollable-slider';
import {
  PiBank,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiCube,
  PiCurrencyCircleDollar,
  PiFolder,
} from 'react-icons/pi';

import TransactionCard from '@core/components/cards/transaction-card';
import { useFilter } from '@/app/contexts/filter-context';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { CardsDashboard } from '@/types';

type FileStatsType = {
  className?: string;
};



export function StatGrid({ data, loading }: { data?: CardsDashboard; loading: boolean }) {

  const { period } = useFilter();


  const cardConfig = [
    {
      key: 'totalHectaresWorked',
      title: 'Hectares trabalhadas',
      icon: PiBank,
      iconWrapperFill: '#8A63D2',
      format: (value: number) => value.toString(),
    },
    {
      key: 'totalExpenses',
      title: 'Total Gastos',
      icon: PiCube,
      iconWrapperFill: '#00CEC9',
      format: (value: string) => value,
    },
    {
      key: 'totalRevenue',
      title: 'Total de receitas',
      icon: PiCurrencyCircleDollar,
      iconWrapperFill: '#0070F3',
      format: (value: string) => value,
    },
    {
      key: 'totalClients',
      title: 'Total clientes',
      icon: PiFolder,
      iconWrapperFill: '#F5A623',
      format: (value: number) => value.toString(),
    },
  ];

  if (loading || !data) {
    return (
      <>
        {cardConfig.map((config, index) => (
          <TransactionCard
            key={`transaction-card-${index}`}
            transaction={{
              title: config.title,
              amount: 'Carregando...',
              increased: false,
              percentage: '0',
              icon: config.icon,
              iconWrapperFill: config.iconWrapperFill,
            }}
            className="min-w-[300px]"
          />
        ))}
      </>
    );
  }

  return (
    <>
      <TransactionCard
        transaction={{
          title: 'Hectares trabalhadas',
          amount: data.totalHectaresWorked.toString(),
          increased: Math.abs(Number(data.referLastPeriodHectaresWorked.toFixed(2))) >= 0,
          percentage: '0',
          icon: PiBank,
          iconWrapperFill: '#8A63D2',
        }}
        period={period}
        className="min-w-[300px]"
      />

      <TransactionCard
        transaction={{
          title: 'Total Gastos',
          amount: data.totalExpenses,
          increased: data.referLastPeriodExpenses >= 0,
          percentage: Math.abs(Number(data.referLastPeriodExpenses.toFixed(2))).toString(),
          icon: PiCube,
          iconWrapperFill: '#00CEC9',
        }}
        period={period}
        className="min-w-[300px]"
      />

      <TransactionCard
        transaction={{
          title: 'Total de receitas',
          amount: data.totalRevenue,
          increased: data.referLastPeriodRevenue >= 0,
          percentage: Math.abs(Number(data.referLastPeriodRevenue.toFixed(2))).toString(),
          icon: PiCurrencyCircleDollar,
          iconWrapperFill: '#0070F3',
        }}
        period={period}
        className="min-w-[300px]"
      />

      <TransactionCard
        percentagemMessage={true}
        transaction={{
          title: 'Total clientes',
          amount: data.totalClients.toString(),
          increased: true,
          percentage: '0',
          icon: PiFolder,
          iconWrapperFill: '#F5A623',
        }}
        period={period}
        className="min-w-[300px]"
      />
    </>
  );
}
export default function FileStats({ className }: FileStatsType) {

  const { period, startDate, endDate } = useFilter();


  const [data, setData] = useState<CardsDashboard>();
  const [loading, setLoading] = useState(true);

  const {
    sliderEl,
    sliderPrevBtn,
    sliderNextBtn,
    scrollToTheRight,
    scrollToTheLeft,
  } = useScrollableSlider();

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
        api.get('/dashboard/general-manager/total-cards', { params })
      );
      setData(response?.data || undefined);
    } catch (error) {
      console.error('Erro ao buscar dados de despesas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, startDate, endDate]);

  return (
    <div
      className={cn(
        'relative flex w-auto items-center overflow-hidden',
        className
      )}
    >
      <Button
        title="Prev"
        variant="text"
        ref={sliderPrevBtn}
        onClick={() => scrollToTheLeft()}
        className="!absolute -left-1 top-0 z-10 !h-full w-20 !justify-start rounded-none bg-gradient-to-r from-gray-0 via-gray-0/70 to-transparent px-0 ps-1 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 3xl:hidden"
      >
        <PiCaretLeftBold className="h-5 w-5" />
      </Button>
      <div className="w-full overflow-hidden">
        <div
          ref={sliderEl}
          className="custom-scrollbar grid grid-flow-col gap-5 overflow-x-auto scroll-smooth 2xl:gap-6 3xl:gap-8 [&::-webkit-scrollbar]:h-0"
        >
          <StatGrid data={data} loading={loading} />
        </div>
      </div>
      <Button
        title="Next"
        variant="text"
        ref={sliderNextBtn}
        onClick={() => scrollToTheRight()}
        className="dark: !absolute -right-2 top-0 z-10 !h-full w-20 !justify-end rounded-none bg-gradient-to-l from-gray-0 via-gray-0/70 to-transparent px-0 pe-2 text-gray-500 hover:text-gray-900 dark:from-gray-50 dark:via-gray-50/70 3xl:hidden"
      >
        <PiCaretRightBold className="h-5 w-5" />
      </Button>
    </div>
  );
}