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
import { adjustToBrazilTimezone, formatCurrency, moneyMask } from '@/utils/format';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';
import { IAccountsPayable } from '@/types';

const settleAccountPayableSchema = z.object({
   id: z.string().optional(),
   dueDate: z.date().optional().nullable(),
   discount: z.string().optional(),
   fine: z.string().optional(),
   interest: z.string().optional(),
   observation: z.string().optional(),
   costCenterId: z.string().optional(),
   paymentMethodId: z.string().nonempty('Método de pagamento não pode ser vazio'),
   paymentDate: z.date().optional().nullable(),
   value: z.string().nonempty('Valor não pode ser vazio'),
   bankAccountId: z.string().optional(),
});

type SettleAccountFormData = z.infer<typeof settleAccountPayableSchema>;

interface SettleAccountPayableProps {
   getAccounts: () => void;
   account: IAccountsPayable;
}

type PaymentMethod = { label: string; value: string; requiresBank?: boolean };

export const SettleAccountPayable = ({ getAccounts, account }: SettleAccountPayableProps) => {
   const [loading, setLoading] = useState(false);
   const { closeModal } = useModal();
   const [showBankSelect, setShowBankSelect] = useState(false);
   const [costCenters, setCostCenters] = useState([]);
   const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
   const [bankAccounts, setBankAccounts] = useState([]);

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
      control,
   } = useForm<SettleAccountFormData>({
      resolver: zodResolver(settleAccountPayableSchema),
   });

   const onSubmit = async (data: SettleAccountFormData) => {
      setLoading(true);

      try {

         const unmaskedFine = data.fine
            ? parseFloat(data.fine.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'))
            : 0;

         const unmaskedInterest = data.interest
            ? parseFloat(data.interest.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'))
            : 0;

         const unmaskedDiscount = data.discount
            ? parseFloat(data.discount.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.'))
            : 0;


         const payload = {
            fine: unmaskedFine,
            interest: unmaskedInterest,
            discount: unmaskedDiscount,
            observation: data.observation || '',
            paymentMethodId: data.paymentMethodId,
            paymentDate: adjustToBrazilTimezone(data.paymentDate ? data.paymentDate : new Date()),
            costCenterId: data.costCenterId || '',
            bankAccountId: data.bankAccountId || '',
         };



         await api.post(`/accounts-payable/${account.id}/settle`, payload);


         toast.success('Pagamento registrado com sucesso!');
         getAccounts();
         closeModal();
      } catch (error: any) {

         console.error('Erro ao liquidar conta:', error);
         const errorMessage = error.response?.data?.message || 'Não foi possível registrar o pagamento';
         toast.error(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      const fetchData = async () => {
         try {

            const costCentersResponse = await api.get('/cost-centers');
            setCostCenters(costCentersResponse.data.map((center: any) => ({
               label: center.name,
               value: center.id
            })));


            const paymentMethodsResponse = await api.get('/payment-methods');
            setPaymentMethods(paymentMethodsResponse.data.map((method: any) => ({
               label: method.name,
               value: method.id,
               requiresBank: method.requiresBank
            })));


            const bankAccountsResponse = await api.get('/bank-accounts');
            setBankAccounts(bankAccountsResponse.data.map((bank: any) => ({
               label: `${bank.bank} - Agência ${bank.agency} - CC ${bank.account}`,
               value: bank.id
            })));

         } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar dados necessários");
         }
      };

      fetchData();
   }, []);

   useEffect(() => {





      const fetchAccountDetails = async () => {

         try {
            setLoading(true);
            const response = await api.get(`/accounts-payable/${account.id}`);

            if (!response) {
               throw new Error(`Error fetching account details: ${response}`);
            }


            const data = await response.data;

            setValue('dueDate', data.dueDate ? new Date(data.dueDate) : null);
            setValue('value', formatCurrency(data.value));
            setValue('discount', formatCurrency(data.discount || 0));
            setValue('fine', formatCurrency(data.fine || 0));
            setValue('interest', formatCurrency(data.interest || 0));
            setValue('costCenterId', data.costCenter?.id || '');
            setValue('paymentMethodId', data.paymentMethodId?.id || '');
            setValue('observation', data.observation || '');

         } catch (err) {
            console.error('Error fetching account details:', err);

         } finally {
            setLoading(false);
         }
      };

      fetchAccountDetails();
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
                  Valor: <span className="font-semibold">{formatCurrency(account.value)}</span>
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
                     options={paymentMethods.length > 0 ? paymentMethods : []}
                     onChange={(selected) => {
                        onChange(selected);
                         const selectedMethod = paymentMethods.find((method) => method.value === selected);
                        const isMoney = selectedMethod?.label === 'Dinheiro';
                        setShowBankSelect(!isMoney);
                     }}
                     value={value || ''}
                     error={"Método de pagamento é obrigatório"}
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
                     options={costCenters.length > 0 ? costCenters : []}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.costCenterId?.message}
                  />
               )}
            />
         </div>

         <div className="md:col-span-3">
            <Controller
               control={control}
               name="paymentDate"
               render={({ field: { onChange, value } }) => (
                  <DatePicker
                     label="Data de Pagamento"
                     selected={value || new Date()}
                     onChange={onChange}
                     dateFormat="dd/MM/yyyy"
                     showMonthYearDropdown
                     minDate={new Date('2000-02-01')}
                     maxDate={new Date()}
                     scrollableMonthYearDropdown
                     placeholderText="Data de pagamento"
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

         {showBankSelect && (
            <div className="md:col-span-3">
               <Controller
                  control={control}
                  name="bankAccountId"
                  render={({ field: { value, onChange } }) => (
                     <SelectField
                        label="Banco"
                        placeholder="Qual banco será utilizado?"
                        options={bankAccounts.length > 0 ? bankAccounts : []}
                        onChange={(selected) => {
                           onChange(selected);
                        }}
                        value={value || ''}
                        error={errors.bankAccountId?.message}
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