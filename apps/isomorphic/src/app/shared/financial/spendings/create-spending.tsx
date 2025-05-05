'use client';
import { toast } from "react-toastify";
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'rizzui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import UploadZone from '@core/ui/file-upload/upload-zone';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { CustomErrorLogin, Expenses, SpendingsType } from '@/types';
import { api } from '@/service/api';
import { DatePicker } from '@core/ui/datepicker';
import { useModal } from '../../modal-views/use-modal';
import { moneyMask } from '@/utils/format';

const userSchema = z.object({
   description: z.string().optional().nullable(),

   expenseId: z.string().min(1, 'Tipo de despesa não pode ser vazio'),

   attachment: z
      .object({
         path: z.string().optional(),
         name: z.string().optional(),
         size: z.number().optional(),
         url: z.string().optional(),
      })
      .nullable()
      .refine((val) => val !== null, 'Comprovante é obrigatório'),

   date: z.date().refine((val) => val !== null, { message: 'Data não pode ser vazia' }),

   value: z.string().min(1, 'Valor não pode ser vazio'),
});

export function CreateSpending({ getList }: { getList: () => void }) {
   const [loading, setLoading] = useState(false);
   const [expensesOptions, setExpensesOptions] = useState<any[]>([]);

   const { closeModal } = useModal();

   const {
      register,
      handleSubmit,
      getValues,
      setValue,
      control,
      formState: { errors },
   } = useForm({
      resolver: zodResolver(userSchema),
   });

   const formatDate = (date: Date) => {
      const fixedDate = new Date(
         Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 3, 0, 0)
      );
      console.log('fixedDate', fixedDate);
      return fixedDate.toISOString(); 
   };

   async function onSubmit(data: SpendingsType) {
      setLoading(true);

      const requestData = { ...data };

      if (!requestData.description) {
         delete requestData.description;
      }

      try {
         const formData = new FormData();
         formData.append('description', requestData.description as string);
         formData.append('expenseId', requestData.expenseId as string);
         formData.append(
            'value',
            requestData.value
               ?.toString()
               .replace(/[^\d,]/g, '')
               .replace(',', '.') as string
         );

         formData.append('date', formatDate(requestData.date as Date));
         
         if (requestData.attachment) {
            const response = await fetch(requestData.attachment.url);
            const blob = await response.blob();
            formData.append('file', blob, requestData.attachment.name);
         }

         await api.post('/spendings', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
         });
         getList();
         toast.success('Despesa lançada com sucesso!');
         closeModal();
      } catch (error) {
         const err = error as CustomErrorLogin;

         toast.error(err.response.data.message || 'Erro ao lançar despesa');
         console.log('Erro ao lançar despesa', err);
      } finally {
         setLoading(false);
      }
   }

   async function getExpenses() {
      try {
         const response = await api.get<Expenses[]>('/expenses');
         if (!response) {
            return;
         }

         const filteredExpenses = response.data.filter((expense) => expense.name).map((expense) => ({ label: expense.name, value: expense.id }));
         setExpensesOptions(filteredExpenses);
      } catch (error) {
         console.error('Error ao buscar despesas:', error);
      }
   }

   useEffect(() => {
      getExpenses();
   }, []);

   return (
      <form className="flex w-full flex-col items-center justify-center" onSubmit={handleSubmit(onSubmit)}>
         <div className="w-full space-y-5">
            <Controller
               control={control}
               name="expenseId"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Tipo de despesa"
                     placeholder="Selecione o tipo de despesa"
                     options={expensesOptions}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.type?.message ? 'Tipo de despesa não pode ser vazio' : ''}
                  />
               )}
            />

            <InputField
               label="Valor"
               type="text"
               placeholder="Digite o valor"
               register={register('value')}
               error={errors.value?.message}
               onChange={(e) => {
                  const value = e.target.value;
                  setValue('value', moneyMask(value));
               }}
            />

            <Controller
               control={control}
               name="date"
               render={({ field: { onChange, value } }) => (
                  <DatePicker
                     label="Data da despesa"
                     selected={value}
                     onChange={onChange}
                     dateFormat="dd/MM/yyyy"
                     showMonthYearDropdown
                     minDate={new Date('1960-02-01')}
                     maxDate={new Date()}
                     scrollableMonthYearDropdown
                     placeholderText="Qual a data dessa despesa?"
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
            <p className="text-sm text-red-500">{errors.date?.message ? 'Data é obrigatória' : ('' as string)}</p>

            <UploadZone name="attachment" getValues={getValues} setValue={setValue} className="col-span-full" />
            {errors.attachment?.message && <span className="mt-2 text-red-500">Comprovante é obrigatório</span>}

            <InputField
               label="Descrição (opcional)"
               placeholder="Digite uma descrição"
               type="text"
               register={register('description')}
               error={errors.description?.message}
            />

            <Button disabled={loading} className="w-full" type="submit" size="lg">
               <span>{loading ? 'Carregando...' : 'Cadastrar'}</span>
            </Button>
         </div>
      </form>
   );
}
