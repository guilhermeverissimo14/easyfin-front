'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from 'react-toastify';

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { moneyMask } from '@/utils/format';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';

const bankAccountSchema = z.object({
   supplierId: z.string().nonempty('Fornecedor não pode ser vazio'),
   documentDate: z.date().optional().nullable(),
   launchDate: z.date().optional().nullable(),
   dueDate: z.date().optional().nullable(),
   value: z.string().nonempty('Valor não pode ser vazio'),
   documentNumber: z.string().optional(),
   observation: z.string().optional(),
   costCenter: z.string().optional(),
   plannedPaymentMethod: z.string().optional(),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface NewAccountPayableProps {
   getAccounts: () => void;
}

export const NewAccountPayable = ({ getAccounts }: NewAccountPayableProps) => {
   const [loading, setLoading] = useState(false);
   const { closeModal } = useModal();

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
      control,
   } = useForm<BankAccountFormData>({
      resolver: zodResolver(bankAccountSchema),
   });

   const onSubmit = async (data: BankAccountFormData) => {};

   const supplierOptions = [
      { label: 'Fornecedor A', value: '123' },
      { label: 'Fornecedor B', value: '124' },
      { label: 'Fornecedor C', value: '125' },
      { label: 'Fornecedor D', value: '126' },
   ];

   const accountTypeOptions = [
      { label: 'Débito', value: 'D' },
      { label: 'Crédito', value: 'C' },
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

         <InputField
            label="Número do Documento"
            placeholder="Informe o número do documento"
            type="text"
            register={register('documentNumber')}
            error={errors.documentNumber?.message}
            maxLength={50}
         />

         <Controller
            control={control}
            name="plannedPaymentMethod"
            render={({ field: { value, onChange } }) => (
               <SelectField
                  label="Método de Pagamento Previsto"
                  placeholder="Selecione o método de pagamento"
                  options={paymentMethodOptions}
                  onChange={(selected) => {
                     onChange(selected);
                  }}
                  value={value || ''}
                  error={errors.plannedPaymentMethod?.message}
               />
            )}
         />

         <Controller
            control={control}
            name="documentDate"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Emissão do documento"
                  selected={value}
                  onChange={onChange}
                  dateFormat="dd/MM/yyyy"
                  showMonthYearDropdown
                  minDate={new Date('2000-02-01')}
                  maxDate={new Date()}
                  scrollableMonthYearDropdown
                  placeholderText="Data do documento"
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
            name="dueDate"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Vencimento"
                  selected={value}
                  onChange={onChange}
                  dateFormat="dd/MM/yyyy"
                  showMonthYearDropdown
                  minDate={new Date('2000-02-01')}
                  maxDate={new Date()}
                  scrollableMonthYearDropdown
                  placeholderText="Data de vencimento"
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
            label="Valor"
            placeholder="Informe o valor"
            type="text"
            register={register('value')}
            error={errors.value?.message}
            onChange={(e) => {
               const value = moneyMask(e.target.value);
               setValue('value', value);
            }}
         />

         <Controller
            control={control}
            name="costCenter"
            render={({ field: { value, onChange } }) => (
               <SelectField
                  label="Centro de Custo "
                  placeholder="Selecione o centro de custo"
                  options={costCenterOptions}
                  onChange={(selected) => {
                     onChange(selected);
                  }}
                  value={value || ''}
                  error={errors.costCenter?.message}
               />
            )}
         />

         <div className="md:col-span-2">
            <InputField
               label="Observação"
               placeholder=""
               type="text"
               register={register('observation')}
               error={errors.observation?.message}
               maxLength={200}
            />
         </div>

         <div className="md:col-span-2">
            <Button disabled={loading} className="w-full" type="submit" size="lg">
               <span>{loading ? 'Carregando...' : 'Cadastrar'}</span>
            </Button>
         </div>
      </form>
   );
};
