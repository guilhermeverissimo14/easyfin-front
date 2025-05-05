'use client';

import { forwardRef } from 'react';
import { Select, SelectProps } from 'rizzui';
import cn from '@core/utils/class-names';

interface PayrollSelectProps extends SelectProps<any> {
  inputClassName?: string;
  value: any;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PayrollSelect = forwardRef<HTMLSelectElement, PayrollSelectProps>(
  ({ inputClassName, value, options, onChange, placeholder }, ref) => {
    return (
      <Select
      placeholder={placeholder}
        ref={ref}
        value={value}
        options={options}
        onChange={(selected: { value: string }) => onChange(selected.value)}
        displayValue={(selected) =>
          options?.find((r) => r.value === selected)?.label ?? ''
        }
        className={cn(
          'shadow-none ring-0 h-auto py-0.5 border-transparent hover:border-primary text-gray-900 dark:text-gray-0',
          inputClassName
        )}
      />
    );
  }
);

PayrollSelect.displayName = 'PayrollSelect';