'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from 'react-toastify';

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { SelectField } from '@/components/input/select-field';
import { moneyMask } from '@/utils/format';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';

const newAccountPayableSchema = z.object({
   supplierId: z.string().optional(),
   costCenterId: z.string().optional(),
   status: z.string().optional(),
   paymentMethodId: z.string().optional(),
   documentDateStart: z.date().optional().nullable(),
   documentDateEnd: z.date().optional().nullable(),
   dueDateStart: z.date().optional().nullable(),
   dueDateEnd: z.date().optional().nullable(),
});

type NewAccountPayableFormData = z.infer<typeof newAccountPayableSchema>;

interface NewAccountPayableProps {
   getAccounts: () => void;
}

export const FilterAccountsPayable = ({ getAccounts }: NewAccountPayableProps) => {
   const [loading, setLoading] = useState(false);
   const { closeModal } = useModal();

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
      control,
   } = useForm<NewAccountPayableFormData>({
      resolver: zodResolver(newAccountPayableSchema),
   });

   const onSubmit = async (data: NewAccountPayableFormData) => {};

   const supplierOptions = [
      { label: 'Fornecedor A', value: '123' },
      { label: 'Fornecedor B', value: '124' },
      { label: 'Fornecedor C', value: '125' },
      { label: 'Fornecedor D', value: '126' },
   ];

   const statusOptions = [
      { label: 'Pendente', value: 'PENDING' },
      { label: 'Pago', value: 'PAID' },
      { label: 'Atrasado', value: 'OVERDUE' },
      { label: 'Cancelado', value: 'CANCELED' },
   ];

   const costCenterOptions = [
      { label: 'Despesas Refeição', value: 'Despesas Refeição' },
      { label: 'Compras', value: 'Compras' },
      { label: 'Fornecedores', value: 'Fornecedores' },
      { label: 'Fretes Transportes', value: 'Fretes Transportes' },
   ];

   const paymentMethodOptions = [
      { label: 'Boleto Bancário', value: 'ticket' },
      { label: 'Dinheiro', value: 'money' },
      { label: 'Cartão de Crédito', value: 'credit_card' },
      { label: 'Cartão de Débito', value: 'debit_card' },
      { label: 'Transferência Bancária', value: 'bank_transfer' },
      { label: 'Pix', value: 'pix' },
   ];

   return (
      <form className="grid w-full grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
         <div className="md:col-span-2">
            <Controller
               control={control}
               name="supplierId"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Fornecedor"
                     placeholder="Selecione o Fornecedor"
                     options={supplierOptions}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.supplierId?.message}
                  />
               )}
            />
         </div>

         <div className="md:col-span-2">
            <Controller
               control={control}
               name="costCenterId"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Centro de Custo"
                     placeholder="Selecione o centro de custo"
                     options={costCenterOptions}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.costCenterId?.message}
                  />
               )}
            />
         </div>

         <Controller
            control={control}
            name="status"
            render={({ field: { value, onChange } }) => (
               <SelectField
                  label="Situação"
                  placeholder="Selecione o status"
                  options={statusOptions}
                  onChange={(selected) => {
                     onChange(selected);
                  }}
                  value={value || ''}
                  error={errors.status?.message}
               />
            )}
         />

         <Controller
            control={control}
            name="paymentMethodId"
            render={({ field: { value, onChange } }) => (
               <SelectField
                  label="Método de Pagamento"
                  placeholder="Selecione o método de pagamento"
                  options={paymentMethodOptions}
                  onChange={(selected) => {
                     onChange(selected);
                  }}
                  value={value || ''}
                  error={errors.paymentMethodId?.message}
               />
            )}
         />

         <Controller
            control={control}
            name="documentDateStart"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Data do Documento (Início)"
                  selected={value}
                  onChange={onChange}
                  dateFormat="dd/MM/yyyy"
                  showMonthYearDropdown
                  minDate={new Date('2000-02-01')}
                  maxDate={new Date()}
                  scrollableMonthYearDropdown
                  placeholderText="Data do documento (início)"
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

         <Controller
            control={control}
            name="documentDateEnd"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Data do Documento (Fim)"
                  selected={value}
                  onChange={onChange}
                  dateFormat="dd/MM/yyyy"
                  showMonthYearDropdown
                  minDate={new Date('2000-02-01')}
                  maxDate={new Date()}
                  scrollableMonthYearDropdown
                  placeholderText="Data do documento (fim)"
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

         <Controller
            control={control}
            name="dueDateStart"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Data do Vencimento (Início)"
                  selected={value}
                  onChange={onChange}
                  dateFormat="dd/MM/yyyy"
                  showMonthYearDropdown
                  minDate={new Date('2000-02-01')}
                  maxDate={new Date()}
                  scrollableMonthYearDropdown
                  placeholderText="Data de vencimento (início)"
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

         <Controller
            control={control}
            name="dueDateEnd"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Data do Vencimento (Fim)"
                  selected={value}
                  onChange={onChange}
                  dateFormat="dd/MM/yyyy"
                  showMonthYearDropdown
                  minDate={new Date('2000-02-01')}
                  maxDate={new Date()}
                  scrollableMonthYearDropdown
                  placeholderText="Data de vencimento (fim)"
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

         <div className="md:col-span-2">
            <Button disabled={loading} className="w-full" type="submit" size="lg">
               <span>{loading ? 'Carregando...' : 'Pesquisar'}</span>
            </Button>
         </div>
      </form>
   );
};
