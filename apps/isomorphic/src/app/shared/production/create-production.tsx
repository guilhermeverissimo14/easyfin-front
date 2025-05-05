'use client';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'rizzui/button';
import { ptBR } from 'date-fns/locale';

import { InputField } from '@/components/input/input-field';
import { DatePicker } from '@core/ui/datepicker';
import { CustomErrorLogin, ProductionRecord } from '@/types';
import { api } from '@/service/api';

const productionSchema = z.object({
   contractId: z.string().optional(),
   date: z.date().refine((val) => val !== null, { message: 'Data não pode ser vazia' }),
   hectaresWorked: z.string().min(1, 'Hectares trabalhados é obrigatório'),
});

interface CreateProductionProps {
   contractId: string;
   getList: () => void;
   onClose?: () => void;
   createProduction?: boolean;
   setCreateProduction: (value: boolean) => void;
}

export function CreateProduction({ contractId, getList, onClose, createProduction, setCreateProduction }: CreateProductionProps) {
   const [loading, setLoading] = useState(false);

   const {
      register,
      handleSubmit,
      setValue,
      control,
      formState: { errors },
   } = useForm({
      resolver: zodResolver(productionSchema),
   });

   async function onSubmit(data: ProductionRecord) {
      setLoading(true);

      const requestData = {
         ...data,
         contractId,
         hectaresWorked: parseFloat(data.hectaresWorked.toString()),
      };

      try {
         await api.post('/production-records', requestData);
         getList();
         toast.success('Produção lançada com sucesso!');
         if (onClose) onClose();
      } catch (error) {
         const err = error as CustomErrorLogin;
         toast.error(err.response.data.message || 'Erro ao lançar produção');
         console.log('Erro ao lançar produção', err);
      } finally {
         setLoading(false);
      }
   }

   return (
      <form className="flex w-full flex-col items-center justify-center" onSubmit={handleSubmit(onSubmit as any)}>
         <div className="mb-4 flex w-full flex-col items-center justify-evenly space-y-5 md:mb-0 md:flex-row">
            <div className="w-full md:w-[33%]">
               <Controller
                  control={control}
                  name="date"
                  render={({ field: { onChange, value } }) => (
                     <DatePicker
                        label="Data da produção"
                        selected={value}
                        onChange={onChange}
                        dateFormat="dd/MM/yyyy"
                        showMonthYearDropdown
                        minDate={new Date('1960-02-01')}
                        maxDate={new Date()}
                        scrollableMonthYearDropdown
                        placeholderText="Qual a data dessa produção?"
                        popperPlacement="bottom-end"
                        inputProps={{
                           variant: 'outline',
                           inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
                        }}
                        className="flex-grow [&>label>span]:font-medium"
                        locale={ptBR}
                     />
                  )}
               />
               <p className="mt-1 text-sm text-red-500">{errors.date?.message ? 'Data é obrigatória' : ('' as string)}</p>
            </div>

            <div style={{ marginTop: 0 }} className="w-full md:w-[33%]">
               <InputField
                  label="Hectares Trabalhados"
                  type="text"
                  placeholder="Quantidade de hectares trabalhados"
                  register={register('hectaresWorked')}
                  error={errors.hectaresWorked?.message}
               />
            </div>

            {createProduction && (
               <Button variant="outline" className="w-full md:w-[10%]" size="lg" onClick={() => setCreateProduction(false)}>
                  Cancelar
               </Button>
            )}

            <Button disabled={loading} className="w-full md:w-[20%]" type="submit" size="lg">
               <span>{loading ? 'Carregando...' : 'Lançar'}</span>
            </Button>
         </div>
      </form>
   );
}
