'use client';

import Image from 'next/image';
import { PayrollInput } from '@/components/input/payroll-input';

export default function FirstBlock() {

  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center">
      <Image alt="Logo" src="/images/logo.png" width={230} height={150} />
      <div className="space-y-1">
        <PayrollInput
          className="md:ms-auto md:max-w-xs"
          value={"Recibo de pagamento de salário"}
          inputClassName="[&_input]:text-end md:text-lg hover:border-transparent text-sm font-medium"
          readOnly
        />
        <PayrollInput
          value={"Minas Drones"}
          className="ms-auto max-w-xs"
          inputClassName="text-4xl text-gray-400 [&_input]:text-end hover:border-transparent font-semibold"
          readOnly
        />
      </div>
    </div>
  );
}