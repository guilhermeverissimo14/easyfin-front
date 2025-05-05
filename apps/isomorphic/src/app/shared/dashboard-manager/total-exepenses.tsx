'use client';

import React, { useEffect, useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { Tooltip} from 'rizzui';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { SkeletonLoader } from '@/components/skeleton/skeleton';
import { useFilter } from '@/app/contexts/filter-context';

const calculatePercentage = (total: number, value: number): string =>
  ((value / total) * 100).toFixed(2);

interface RulerProps {
  total: number;
  value: number;
  rulerSteps: string[];
}

const Ruler: React.FC<RulerProps> = ({ total, value, rulerSteps }) => {
  const percentage = calculatePercentage(total, value);

  return (
    <div className='-z-0'>
      <div className="relative flex h-10 flex-col justify-end overflow-hidden rounded-[10px] bg-gray-100">
        <div
          className="absolute bottom-0 left-0 top-0 z-10 h-full bg-primary"
          style={{ width: `${percentage || 0}%` }}
        />
        <div className="relative z-20 mt-auto flex w-full items-end justify-between [&>:nth-child(10n+1)]:!h-4">
          {[...Array(101)].map((_, index) => (
            <span
              key={index}
              className="h-2.5 w-[1px] bg-gray-900 dark:bg-gray-300"
            />
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between">
        {rulerSteps.map((item, index) => (
          <div
            key={index}
            className="flex w-[1px] justify-center first-of-type:justify-start last-of-type:justify-end"
          >
            <span className="text-xs text-gray-500">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SliderProps {
  title: string;
  total: number;
  maxTotal: number;
}

const Slider: React.FC<SliderProps> = ({ title, total, maxTotal }) => {
  const percentage = (total / maxTotal) * 100;

  return (
    <div className="group">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="font-medium text-gray-900">{title}</p>
        <div className="flex items-center">
          &nbsp;
          <span>R${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
      <div className="relative h-2.5 w-full rounded-lg bg-gray-100">
        <div
          className="h-full rounded-lg bg-primary"
          style={{ width: `${percentage || 0}%` }}
        />
        <div className="absolute left-0 top-1/2 flex h-0 w-full -translate-y-1/2 items-center">
          <div className="relative w-full">
            <Tooltip
              className="dark:bg-gray-200 dark:text-gray-900"
              placement="top"
              content={<span>{percentage.toFixed(2) || 0}%</span>}
            >
              <span
                className="absolute top-1/2 block h-5 w-5 -translate-x-1/2 -translate-y-1/2 scale-75 cursor-pointer rounded-full border-[5.5px] border-gray-0 bg-primary opacity-0 shadow-md transition-all duration-100 group-hover:scale-100 group-hover:opacity-100 dark:border-muted"
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

interface BudgetStatusProps {
  className?: string;
}

interface TotalExpenseData {
  expenses: {
    expenseCategory: string;
    totalValue: number;
    totalValueFormatted: string;
  }[];
  totalValue: number;
  totalValueFormatted: string;
  rulerSteps: string[];
}


const TotalExpenses: React.FC<BudgetStatusProps> = ({ className }) => {

  const { period, startDate, endDate } = useFilter(); 

  const [data, setData] = useState<TotalExpenseData[]>([]);
  const [rulerSteps, setRulerSteps] = useState<string[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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
        api.get('dashboard/general-manager/total-expenses', { params })
      );

      const { expenses, totalValue, rulerSteps } = response?.data || {};
      setData(expenses || []);
      setTotalValue(totalValue || 0);
      setRulerSteps(rulerSteps || []);
    } catch (error) {
      console.error('Erro ao buscar dados de despesas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRulerTotal = () => {
    if (rulerSteps.length === 0) return 0;

    const lastStep = rulerSteps[rulerSteps.length - 1];
    if (lastStep.includes('K')) {
      return parseFloat(lastStep.replace('K', '')) * 1000;
    }
    return parseFloat(lastStep);
  };

  const rulerTotal = getRulerTotal();

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, period]);

  return (
    <WidgetCard
      title="Gastos totais"
      headerClassName="flex flex-row"
      actionClassName="ps-0 mb-4 @[30rem]:mb-4"
      titleClassName="text-gray-700 font-bold font-inter"
      className={className}
      action ={
        <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-gray-900 @[30rem]:text-xl">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalValue)}
            </span>
          </div>
      }
    >
      {loading ? (
        <SkeletonLoader />
      ) : (
        <>
          <Ruler total={rulerTotal} value={totalValue} rulerSteps={rulerSteps} />
          <div className="mt-12 space-y-7">
            {data.map((item: any, index: number) => (
              <Slider
                key={index}
                title={item.expenseCategory}
                total={item.totalValue}
                maxTotal={totalValue}
              />
            ))}
          </div>
        </>
      )}
    </WidgetCard>
  );
};

export default TotalExpenses;