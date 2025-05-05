'use client';

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Title } from 'rizzui';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import WidgetCard from '@core/components/cards/widget-card';
import DropdownAction from '@core/components/charts/dropdown-action';
import cn from '@core/utils/class-names';
import { CustomTooltip } from '@core/components/charts/custom-tooltip';

const cashFlowData = [
  {
    label: format(new Date(2025, 0, 1), 'MMM', { locale: ptBR }), 
    contasReceber: 665,
    contasPagar: 454,
  },
  {
    label: format(new Date(2025, 1, 1), 'MMM', { locale: ptBR }),
    contasReceber: 589,
    contasPagar: 351,
  },
  {
    label: format(new Date(2025, 2, 1), 'MMM', { locale: ptBR }),
    contasReceber: 470,
    contasPagar: 100,
  },
  {
    label: format(new Date(2025, 3, 1), 'MMM', { locale: ptBR }), 
    contasReceber: 571,
    contasPagar: 283,
  },
  {
    label: format(new Date(2025, 4, 1), 'MMM', { locale: ptBR }), 
    contasReceber: 1050,
    contasPagar: 850,
  },
  {
    label: format(new Date(2025, 5, 1), 'MMM', { locale: ptBR }),
    contasReceber: 750,
    contasPagar: 190,
  },
  {
    label: format(new Date(2025, 6, 1), 'MMM', { locale: ptBR }), 
    contasReceber: 875,
    contasPagar: 700,
  },
  {
    label: format(new Date(2025, 7, 1), 'MMM', { locale: ptBR }), 
    contasReceber: 568,
    contasPagar: 410,
  },
  {
    label: format(new Date(2025, 8, 1), 'MMM', { locale: ptBR }),
    contasReceber: 775,
    contasPagar: 550,
  },
  {
    label: format(new Date(2025, 9, 1), 'MMM', { locale: ptBR }),
    contasReceber: 680,
    contasPagar: 488,
  },
  {
    label: format(new Date(2025, 10, 1), 'MMM', { locale: ptBR }), 
    contasReceber: 580,
    contasPagar: 390,
  },
  {
    label: format(new Date(2025, 11, 1), 'MMM', { locale: ptBR }), 
    contasReceber: 438,
    contasPagar: 250,
  },
];

// Legendas traduzidas
export const cashFlowLegend = [
  { name: 'Contas a Receber' },
  { name: 'Contas a Pagar' },
];

// Cores para Contas a Receber e Contas a Pagar
export const CASH_FLOW_COLORS = ['#00766B', '#F56565', '#28D775'];

// Filtro por Mês e Ano
export const financialViewOptions = [
  {
    value: 'Mes',
    label: 'Mês',
  },
  {
    value: 'Ano',
    label: 'Ano',
  },
];

export default function CashFlow({ className }: { className?: string }) {
  function handleChange(viewType: string) {
    console.log('Filtro selecionado:', viewType);
  }

  return (
    <WidgetCard
      title="Fluxo Financeiro"
      titleClassName="text-gray-700 font-bold font-inter"
      headerClassName="items-center"
      className={cn('min-h-[28rem]', className)}
      action={
        <div className="flex gap-5">
          <CustomLegend className="hidden @[28rem]:inline-flex" />
          <DropdownAction
            onChange={handleChange}
            className="rounded-md border"
            options={financialViewOptions}
            dropdownClassName="!z-0"
          />
        </div>
      }
    >
      <div className="mb-3 mt-1 flex items-center gap-2 @[28rem]:mb-4">
        <Title as="h2" className="font-semibold">
         R$ 78.450,00
        </Title>
      </div>
      <CustomLegend className="-mt-0 mb-4 inline-flex @[28rem]:hidden" />
      <div className="w-full lg:mt-7">
        <div className="custom-scrollbar overflow-x-auto scroll-smooth -mb-3 pb-3">
          <div className="h-[24rem] w-full pt-6 @lg:pt-8">
            <ResponsiveContainer width="100%" height="100%" minWidth={1450}>
              <ComposedChart
                barGap={8}
                data={cashFlowData}
                margin={{
                  left: -20,
                  top: 20,
                }}
                className="[&_.recharts-tooltip-cursor]:fill-opacity-20 dark:[&_.recharts-tooltip-cursor]:fill-opacity-10 [&_.recharts-bar]:translate-x-4 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500 [&_.recharts-cartesian-axis.yAxis]:-translate-y-3 [&_.recharts-cartesian-axis.yAxis]:translate-x-2.5 rtl:[&_.recharts-cartesian-axis.yAxis]:-translate-x-12 [&_.recharts-xAxis.xAxis]:translate-x-[14px] [&_.recharts-xAxis.xAxis]:translate-y-2.5 [&_path.recharts-rectangle]:!stroke-none"
              >
                <CartesianGrid
                  vertical={false}
                  strokeOpacity={0.435}
                  strokeDasharray="8 10"
                />
                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(label) => `R$ ${Number(label).toFixed(2).toString().replace('.',',')}`} width={100}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar
                  dataKey="contasReceber"
                  fill={CASH_FLOW_COLORS[0]}
                  barSize={28}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  type="natural"
                  dataKey="contasPagar"
                  fill={CASH_FLOW_COLORS[1]}
                  barSize={28}
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

function CustomLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mt-2 flex flex-wrap items-start gap-3 lg:gap-7',
        className
      )}
    >
      {cashFlowLegend.map((item, index) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: CASH_FLOW_COLORS[index] }}
          />
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}