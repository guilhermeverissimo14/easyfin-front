'use client';

import { Input, InputProps } from 'rizzui';
import { UseFormRegisterReturn } from 'react-hook-form';

type InputFieldProps = {
   label: string;
   placeholder: string;
   type: InputProps['type'];
   register: UseFormRegisterReturn;
   error?: any;
   value?: string;
   disabled?: boolean;
   maxLength?: number;
   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const InputField = ({ label, placeholder, type, register, error, value, disabled, maxLength, onChange }: InputFieldProps) => (
   <div>
      <Input
         type={type}
         size="lg"
         label={label}
         placeholder={placeholder}
         className="mt-0 [&>label>span]:font-medium"
         {...register}
         inputClassName="text-sm"
         value={value}
         disabled={disabled}
         maxLength={maxLength}
         onChange={onChange}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
   </div>
);
