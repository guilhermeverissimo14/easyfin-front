'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from 'react-toastify';

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';
import { moneyMask } from '@/utils/format';
import { IAccountsReceivable } from '@/types';

const editAccountReceivableSchema = z.object({
   id: z.string().optional(),
   documentNumber: z.string().optional(),
   documentDate: z.date().optional().nullable(),
   launchDate: z.date().optional().nullable(),
   dueDate: z.date().optional().nullable(),
   discount: z.string().optional(),
   fine: z.string().optional(),
   interest: z.string().optional(),
   observation: z.string().optional(),
   costCenterId: z.string().optional(),
   paymentMethodId: z.string().nonempty('Método de pagamento não pode ser vazio'),
   value: z.string().nonempty('Valor não pode ser vazio'),
});

type EditAccountFormData = z.infer<typeof editAccountReceivableSchema>;

interface EditAccountReceivableProps {
   getAccounts: () => void;
   account: IAccountsReceivable;
}

export const EditAccountReceivable = ({ getAccounts, account }: EditAccountReceivableProps) => {
   const [loading, setLoading] = useState(false);
   const { closeModal } = useModal();

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
      control,
   } = useForm<EditAccountFormData>({
      resolver: zodResolver(editAccountReceivableSchema),
   });

   const onSubmit = async (data: EditAccountFormData) => {
      setLoading(true);
      try {
         // Call API to update account receivable
         await api.put(`/accounts-receivable/${data.id}`, data);
         toast.success('Conta a receber atualizada com sucesso!');
         getAccounts();
         closeModal();
      } catch (error) {
         toast.error('Erro ao atualizar conta a receber.');
      } finally {
         setLoading(false);
      }
   };

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

   useEffect(() => {
      setValue('id', account.id);
      setValue('documentNumber', account.documentNumber || '');
      setValue('documentDate', account.documentDate ? new Date(account.documentDate) : null);
      setValue('launchDate', account.launchDate ? new Date(account.launchDate) : null);
      setValue('dueDate', account.dueDate ? new Date(account.dueDate) : null);
      setValue('discount', moneyMask(String(account.discount)));
      setValue('fine', moneyMask(String(account.fine)));
      setValue('interest', moneyMask(String(account.interest)));
      setValue('value', moneyMask(String(account.value)));
      setValue('observation', account.observation || '');
   }, [account, setValue]);

   return (
      <form className="grid w-full grid-cols-1 gap-4 md:grid-cols-3" onSubmit={handleSubmit(onSubmit)}>
         <div className="md:col-span-3">
            <div className="flex items-center">
               <p className="text-lg font-semibold">{account.customerName}</p>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-2">
            <InputField
               label="Número do Documento"
               placeholder="Informe o número do documento"
               type="text"
               register={register('documentNumber')}
               error={errors.documentNumber?.message}
               maxLength={50}
            />

            <InputField
               label="Valor"
               placeholder=""
               type="text"
               register={register('value')}
               error={errors.value?.message}
               maxLength={50}
               onChange={(e) => {
                  const value = moneyMask(e.target.value);
                  setValue('value', value);
               }}
            />
         </div>

         <div className="grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-2">
            <Controller
               control={control}
               name="documentDate"
               render={({ field: { onChange, value } }) => (
                  <DatePicker
                     label="Data Documento"
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
                     label="Data Vencimento"
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
         </div>

         <InputField
            label="Multa"
            placeholder=""
            type="text"
            register={register('fine')}
            error={errors.fine?.message}
            maxLength={50}
            onChange={(e) => {
               const value = moneyMask(e.target.value);
               setValue('fine', value);
            }}
         />

         <InputField
            label="Juros"
            placeholder=""
            type="text"
            register={register('interest')}
            error={errors.interest?.message}
            maxLength={50}
            onChange={(e) => {
               const value = moneyMask(e.target.value);
               setValue('interest', value);
            }}
         />

         <InputField
            label="Desconto"
            placeholder=""
            type="text"
            register={register('discount')}
            error={errors.discount?.message}
            maxLength={50}
            onChange={(e) => {
               const value = moneyMask(e.target.value);
               setValue('discount', value);
            }}
         />

         <div className="md:col-span-3">
            <InputField
               label="Observação"
               placeholder=""
               type="text"
               register={register('observation')}
               error={errors.observation?.message}
               maxLength={200}
            />
         </div>

         <div className="grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-2">
            <Controller
               control={control}
               name="paymentMethodId"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Método de Pagamento Previsto"
                     placeholder="Selecione o Método de Pagamento"
                     options={paymentMethodOptions}
                     onChange={onChange}
                     value={value || ''}
                     error={errors.paymentMethodId?.message}
                  />
               )}
            />

            <Controller
               control={control}
               name="costCenterId"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Centro de Custo "
                     placeholder="Selecione o centro de custo"
                     options={costCenterOptions}
                     onChange={onChange}
                     value={value || ''}
                     error={errors.costCenterId?.message}
                  />
               )}
            />
         </div>

         <div className="md:col-span-3">
            <Button disabled={loading} className="w-full" type="submit" size="lg">
               <span>{loading ? 'Salvando...' : 'Confirmar'}</span>
            </Button>
         </div>
      </form>
   );
};
