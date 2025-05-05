'use client';

import { PayrollInput } from '@/components/input/payroll-input';
import { formatMoneyBrl } from '@/utils/format';

export default function CalcPayBlock({
  provent,
  discount,
  totalCommission,
   totalGrossValue
}: {
  provent: number;
  discount: number;
  totalCommission: number;
  totalGrossValue: number;
}) {
  let total = provent - discount;
  return (
    <div className="mt-4">
      <div className="ms-auto w-full max-w-xs divide-y dark:divide-muted/20">
        <div className="grid grid-cols-2 items-center gap-2 pb-2">
          <div>
            <PayrollInput
              value="Proventos"
              inputClassName="font-medium hover:border-transparent"
              readOnly
            />
          </div>
          <div className="text-end text-gray-900 dark:text-gray-0">
            {provent ? `${formatMoneyBrl(provent)}` : '--'}
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2 py-2">
          <div>
            <PayrollInput
              value="Descontos"
              inputClassName="font-medium hover:border-transparent"
              readOnly
            />
          </div>
          <div className="text-end text-gray-900 dark:text-gray-0">
            {discount ? `${formatMoneyBrl(discount)}` : '--'}
          </div>
        </div>
        <div className="grid grid-cols-2 items-center gap-2 pt-2">
          <div>
            <PayrollInput
              value="Total liquido"
              inputClassName="font-medium hover:border-transparent"
              readOnly
            />
          </div>
          <div className="text-end font-semibold text-gray-900 dark:text-gray-0">
            {total ? `${formatMoneyBrl(total)}` : '--'}
          </div>
        </div>
      </div>
      <div className="max-w-sm space-y-0.5 mt-16 md:mt-0">
 
        <PayrollInput
          value="Comissão"
          className="font-semibold "
          inputClassName='hover:border-transparent'
          readOnly
        />
        <PayrollInput
          value={`Produção mensal: ${formatMoneyBrl(totalCommission || 0)} `}
          className="font-medium"
          inputClassName='hover:border-transparent'
          readOnly
        />
        <PayrollInput
          value={`Valor da comissão: ${formatMoneyBrl(totalGrossValue || 0)}`}
          className="font-medium "
          inputClassName='hover:border-transparent'
          readOnly
        />

      </div>
    </div>
  );
}
