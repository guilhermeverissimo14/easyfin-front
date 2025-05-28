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
import { moneyMask } from '@/utils/format';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';

const settleAccountPayableSchema = z.object({
   id: z.string().optional(),
   dueDate: z.date().optional().nullable(),
   discount: z.string().optional().default('R$ 0,00'), // desconto
   fine: z.string().optional().default('0'), // multa
   interest: z.string().optional().default('R$ 0,00'), // juros
   observation: z.string().optional(),
   costCenterId: z.string().optional(),
   paymentMethodId: z.string().nonempty('Método de pagamento não pode ser vazio'),
   paymentDate: z.date().optional().nullable(),
   value: z.string().nonempty('Valor não pode ser vazio'),
   bankId: z.string().optional(),
});

type SettleAccountFormData = z.infer<typeof settleAccountPayableSchema>;

interface IAccountPayable {
   id: string;
   documentNumber: string;
   supplierId: string;
   supplierName: string;
   status: string;
   launchDate: string;
   dueDate: string;
   installmentNumber: number;
   totalInstallments: number;
   value: number;
}

interface SettleAccountPayableProps {
   getAccounts: () => void;
   account: IAccountPayable;
}

export const SettleAccountPayable = ({ getAccounts, account }: SettleAccountPayableProps) => {
   const [loading, setLoading] = useState(false);
   const { closeModal } = useModal();
   const [showBankSelect, setShowBankSelect] = useState(false);

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
      control,
   } = useForm<SettleAccountFormData>({
      resolver: zodResolver(settleAccountPayableSchema),
   });

   const onSubmit = async (data: SettleAccountFormData) => {};

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

   const bankOptions = [
      { label: 'Banco do Brasil - Agência 1234 - CC 56789-0', value: '55dff79d-d166-44e4-b1b9-71c5855fd2a0' },
      { label: 'Itaú - Agência 4321 - CC 98765-0', value: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
   ];

   useEffect(() => {
      setValue('id', account.id);
      setValue('discount', moneyMask('R$ 0,00'));
      setValue('fine', 'R$ 0,00');
      setValue('interest', moneyMask('R$ 0,00'));
   }, [account, setValue]);

   return (
      <form className="grid w-full grid-cols-1 gap-4 md:grid-cols-3" onSubmit={handleSubmit(onSubmit)}>
         <div className="md:col-span-3">
            <div className="flex items-center">
               <p className="text-lg font-semibold">{account.supplierName}</p>
            </div>
         </div>

         <div className="flex flex-row justify-between md:col-span-3">
            <div className="flex flex-col items-start justify-center md:col-span-1">
               <span className="text-sm text-gray-500">
                  Documento <span className="font-semibold">{account.documentNumber}</span>
               </span>
               <span className="text-xs text-gray-500">
                  Parcela {account.installmentNumber} de {account.totalInstallments}
               </span>
            </div>

            <div className="flex flex-col items-start justify-center md:col-span-1">
               <span className="text-sm text-gray-500">
                  Valor: <span className="font-semibold">{moneyMask(String(account.value))}</span>
               </span>
               <span className="text-xs text-gray-500">Lançamento: {new Date(account.launchDate).toLocaleDateString('pt-BR')}</span>
            </div>

            <div className="flex flex-col items-start justify-center md:col-span-1">
               <div className="text-sm text-gray-500">
                  <div className="flex flex-row items-center gap-2">
                     Situação:{' '}
                     {account.status === 'Aberto' ? (
                        <div className="w-22">
                           <div className="border-1 cursor-pointer rounded-md border border-[#ABD2EF] bg-[#ABD2EF] px-2 text-center text-xs text-white">
                              Aberto
                           </div>
                        </div>
                     ) : account.status === 'Atrasado' ? (
                        <div className="w-22">
                           <div className="border-1 cursor-pointer rounded-md border border-red-400 bg-red-400 px-2 text-center text-xs text-white">
                              Vencido
                           </div>
                        </div>
                     ) : null}
                  </div>
                  <span className="text-xs text-gray-500">Vencimento: {new Date(account.dueDate).toLocaleDateString('pt-BR')}</span>
               </div>
            </div>
         </div>

         <hr className="my-3 md:col-span-3" />

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
                     label="Método de Pagamento"
                     placeholder="Selecione o Método de Pagamento"
                     options={paymentMethodOptions}
                     onChange={(selected) => {
                        onChange(selected);
                        setShowBankSelect(selected !== 'money');
                     }}
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
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.costCenterId?.message}
                  />
               )}
            />
         </div>

         {showBankSelect && (
            <div className="md:col-span-3">
               <Controller
                  control={control}
                  name="bankId"
                  render={({ field: { value, onChange } }) => (
                     <SelectField
                        label="Banco"
                        placeholder="Qual banco será utilizado?"
                        options={bankOptions}
                        onChange={(selected) => {
                           onChange(selected);
                        }}
                        value={value || ''}
                        error={errors.bankId?.message}
                     />
                  )}
               />
            </div>
         )}

         <div className="md:col-span-3">
            <Button disabled={loading} className="w-full" type="submit" size="lg">
               <span>{loading ? 'Salvando...' : 'Liquidar'}</span>
            </Button>
         </div>
      </form>
   );
};
