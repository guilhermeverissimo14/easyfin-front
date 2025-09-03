'use client';

import { Select } from 'rizzui';

type SelectFieldProps = {
  label?: string;
  placeholder: string;
  options: { label: string; value: string }[];
  error?: string;
  value: any;
  className?: string;
  onChange: (value: string) => void;
};

export const SelectField = ({ label, placeholder, options, error, value, className, onChange }: SelectFieldProps) => (
  <div>
    <Select
      label={label}
      placeholder={placeholder}
      size="lg"
      className={`[&>label>span]:font-medium ${className}`}
      value={value} 
      options={options}
      onChange={(selected: { value: string }) => onChange(selected.value)}
      displayValue={(selected) =>
        options?.find((r) => r.value === selected)?.label ?? ''
      }
    />
    {error && <p className="text-red-500 mt-1 text-sm">{error}</p>}
  </div>
);
