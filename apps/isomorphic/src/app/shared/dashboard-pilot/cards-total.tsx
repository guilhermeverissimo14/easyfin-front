'use client';

import { useEffect, useState } from 'react';
import { Button } from 'rizzui';
import cn from '@core/utils/class-names';
import { useScrollableSlider } from '@core/hooks/use-scrollable-slider';
import {
  PiBank,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiCurrencyCircleDollar,
  PiClockCountdown,
  PiCube,
} from 'react-icons/pi';

import TransactionCard from '@core/components/cards/transaction-card';
import { useFilter } from '@/app/contexts/filter-context';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { userType } from '@/types';

type PilotStatsType = {
  className?: string;
};

interface PilotDashboardData {
  totalInspectedArea: number;
  closedContractsCount: number;
  ongoingContractsCount: number;
  weeklyExpenses: number;
  weeklyExpensesFormatted?: string;
}

export function PilotStatGrid({ data, loading }: { data?: PilotDashboardData; loading: boolean }) {
  const { period } = useFilter();

  const cardConfig = [
    {
      key: 'totalInspectedArea',
      title: 'Total de Hectares Inspecionados',
      icon: PiBank,
      iconWrapperFill: '#8A63D2',
    },
    {
      key: 'closedContractsCount',
      title: 'Contratos fechados',
      icon: PiCube,
      iconWrapperFill: '#00CEC9',
    },
    {
      key: 'ongoingContractsCount',
      title: 'Contratos em andamento',
      icon: PiClockCountdown,
      iconWrapperFill: '#0070F3',
    },
    {
      key: 'weeklyExpenses',
      title: 'Gastos da semana',
      icon: PiCurrencyCircleDollar,
      iconWrapperFill: '#F5A623',
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

 
  const weeklyExpensesFormatted = data.weeklyExpensesFormatted || 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.weeklyExpenses);

  return (
    <>
      <TransactionCard
         percentagemMessage={true}
        transaction={{
          title: 'Total de Hectares Inspecionados',
          amount: data.totalInspectedArea.toString(),
          increased: true,
          percentage: '0',
          icon: PiBank,
          iconWrapperFill: '#8A63D2',
        }}
        period={period}
        className="min-w-[300px]"
      />

      <TransactionCard
       percentagemMessage={true}
        transaction={{
          title: 'Contratos fechados',
          amount: data.closedContractsCount.toString(),
          increased: true,
          percentage: '0',
          icon: PiCube,
          iconWrapperFill: '#00CEC9',
        }}
        period={period}
        className="min-w-[300px]"
      />

      <TransactionCard
       percentagemMessage={true}
        transaction={{
          title: 'Contratos em andamento',
          amount: data.ongoingContractsCount.toString(),
          increased: true,
          percentage: '0',
          icon: PiClockCountdown,
          iconWrapperFill: '#0070F3',
        }}
        period={period}
        className="min-w-[300px]"
      />

      <TransactionCard
        percentagemMessage={true}
        transaction={{
          title: 'Gastos da semana',
          amount: weeklyExpensesFormatted,
          increased: false,
          percentage: '0',
          icon: PiCurrencyCircleDollar,
          iconWrapperFill: '#F5A623',
        }}
        period={period}
        className="min-w-[300px]"
      />
    </>
  );
}

export default function PilotStats({ className }: PilotStatsType) {
  const { period, startDate, endDate } = useFilter();
  const [data, setData] = useState<PilotDashboardData>();
  const [loading, setLoading] = useState(true);
  
  const sessionUser: userType = JSON.parse(localStorage.getItem('eas:user') || '{}') as userType;

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
      const params: Record<string, string | undefined> = {
        pilotId: sessionUser?.id
      };
      
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      } else if (period) {
        params.period = period;
      }

      const response = await apiCall(() =>
        api.get('/dashboard/pilot/dashboard-data', { params })
      );
      
      if (response?.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard do piloto:', error);
     
      setData({
        totalInspectedArea: 0,
        closedContractsCount: 0,
        ongoingContractsCount: 0,
        weeklyExpenses: 0,
        weeklyExpensesFormatted: 'R$ 0,00'
      });
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
          <PilotStatGrid data={data} loading={loading} />
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