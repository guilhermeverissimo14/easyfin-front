'use client';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "react-toastify";

import { useModal } from '../../modal-views/use-modal';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { Expenses, SpendingsType } from '@/types';
import { InputField } from '@/components/input/input-field';
import { Button } from 'rizzui/button';
import { SelectField } from '@/components/input/select-field';
import { formatMoney, moneyMask } from '@/utils/format';
import { DatePicker } from '@core/ui/datepicker';

const userSchema = z.object({
   description: z.string().optional().nullable(),
   date: z.date().refine((val) => val !== null, { message: 'Data não pode ser vazia' }),
   expenseId: z.string().min(1, 'Tipo de despesa não pode ser vazio'),
   value: z.string().min(1, 'Valor não pode ser vazio'),
});

interface EditSpendingProps {
   id: string;
   getList: () => void;
}

export const EditSpending = ({ id, getList }: EditSpendingProps) => {
   const [loading, setLoading] = useState(false);
   const [expensesOptions, setExpensesOptions] = useState<any[]>([]);
   const [expenseDetails, setExpenseDetails] = useState<SpendingsType | null>(null);

   const { closeModal } = useModal();

   const {
      register,
      handleSubmit,
      setValue,
      control,
      formState: { errors },
   } = useForm({
      resolver: zodResolver(userSchema),
   });

   const formatDate = (date: Date) => {
      return format(date, 'yyyy-MM-dd');
   };

   async function getExpenses() {
      try {
         const response = await apiCall(() => api.get<Expenses[]>('/expenses'));
         if (!response) {
            return;
         }
         const filteredExpenses = response.data.filter((expense) => expense.name).map((expense) => ({ label: expense.name, value: expense.id }));
         setExpensesOptions(filteredExpenses);
      } catch (error) {
         console.error('Error ao buscar despesas:', error);
      }
   }

   async function getExpenseDetails() {
      const response = await apiCall(() => api.get<SpendingsType[]>(`spendings`));
      if (!response) {
         return;
      }

      const filteredExpenseId = response.data.filter((expense) => expense.id === id);

      if (filteredExpenseId.length > 0 && filteredExpenseId[0].date) {
         const utcDate = new Date(filteredExpenseId[0].date);
         const localDate = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);
         console.log('localDate', localDate);
         setValue('date', localDate);
      } else {
         setValue('date', new Date());
      }

      setExpenseDetails(filteredExpenseId[0]);
      setValue('description', filteredExpenseId[0].description);
      setValue('expenseId', filteredExpenseId[0].expense?.id);
      setValue('value', formatMoney(filteredExpenseId[0].value as number));
   }

   useEffect(() => {
      getExpenses();
      getExpenseDetails();
   }, []);

   async function onSubmit(data: SpendingsType) {
      setLoading(true);
      const requestData = { ...data };

      if (!requestData.description) {
         delete requestData.description;
      }
      requestData.value = parseFloat(
         requestData.value
            ?.toString()
            .replace(/[^\d,]/g, '')
            .replace(',', '.') as string
      );
      requestData.date = formatDate(requestData.date as Date) as unknown as Date;
      try {
         await api.put(`/spendings/${id}`, requestData);
         getList?.();
         toast.success('Despesa atualizada com sucesso!');
         closeModal();
         setLoading(false);
      } catch (error) {
         toast.error('Erro ao atualizar despesa');
         console.error('Erro ao atualizar despesa:', error);
         setLoading(false);
      }
   }

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
            <InputField
               label="Descrição (opcional)"
               placeholder="Digite uma descrição"
               type="text"
               register={register('description')}
               error={errors.description?.message}
            />

            <Button disabled={loading} className="w-full" type="submit" size="lg">
               <span>{loading ? 'Carregando...' : 'Salvar'}</span>
            </Button>
         </div>
      </form>
   );
};
