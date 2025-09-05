'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Title, Text } from 'rizzui';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';
import { PiQuestionBold } from 'react-icons/pi';

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { moneyMask, formatCurrency } from '@/utils/format';
import { IAccountsReceivable } from '@/types';

const settleAccountReceivableSchema = z.object({
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
   generateCashFlow: z.boolean().optional(),
});

type SettleAccountFormData = z.infer<typeof settleAccountReceivableSchema>;

interface SettleAccountReceivableProps {
   getAccounts: () => void;
   account: IAccountsReceivable;
}

type PaymentMethod = { label: string; value: string; requiresBank?: boolean };

const CashFlowConfirmationModal = ({ onConfirm, onCancel }: { onConfirm: (generateCashFlow: boolean) => void; onCancel: () => void }) => {
   return (
      <div className="w-full max-w-md bg-white p-6">
         <div className="mb-4 flex items-center">
            <PiQuestionBold className="me-2 size-5 text-blue-500" />
            <Title as="h6" className="text-lg font-semibold">
               Gerar Movimentação no Livro Caixa?
            </Title>
         </div>
         <Text className="mb-6 text-gray-600">
            Deseja gerar uma movimentação no livro caixa para este recebimento?
         </Text>
         <div className="flex gap-3">
            <Button
               variant="outline"
               className="flex-1"
               onClick={() => {
                  onConfirm(false);
                  onCancel();
               }}
            >
               Não
            </Button>
            <Button
               className="flex-1"
               onClick={() => {
                  onConfirm(true);
                  onCancel();
               }}
            >
               Sim
            </Button>
         </div>
      </div>
   );
};

export const SettleAccountReceivable = ({ getAccounts, account }: SettleAccountReceivableProps) => {
   const [loading, setLoading] = useState(false);
   const { closeModal, openModal } = useModal();
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
      resolver: zodResolver(settleAccountReceivableSchema),
   });

   const processReceive = async (data: SettleAccountFormData, generateCashFlow: boolean) => {
      setLoading(true);

      try {
         const unmaskedFine = data.fine
            ? parseFloat(
                 data.fine
                    .replace(/[^\d,.-]/g, '')
                    .replace('.', '')
                    .replace(',', '.')
              )
            : 0;

         const unmaskedInterest = data.interest
            ? parseFloat(
                 data.interest
                    .replace(/[^\d,.-]/g, '')
                    .replace('.', '')
                    .replace(',', '.')
              )
            : 0;

         const unmaskedDiscount = data.discount
            ? parseFloat(
                 data.discount
                    .replace(/[^\d,.-]/g, '')
                    .replace('.', '')
                    .replace(',', '.')
              )
            : 0;

         const payload = {
            fine: unmaskedFine,
            interest: unmaskedInterest,
            discount: unmaskedDiscount,
            observation: data.observation || '',
            paymentMethodId: data.paymentMethodId,
            receiptDate: data.paymentDate ? data.paymentDate.toISOString() : new Date().toISOString(),
            costCenterId: data.costCenterId || '',
            bankAccountId: data.bankAccountId || '',
            generateCashFlow,
         };

         await api.post(`/accounts-receivable/${account.id}/receive`, payload);

         toast.success('Recebimento registrado com sucesso!');
         getAccounts();
         closeModal();
      } catch (error: any) {
         console.error('Erro ao receber conta:', error);
         const errorMessage = error.response?.data?.message || 'Não foi possível registrar o recebimento';
         toast.error(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   const onSubmit = async (data: SettleAccountFormData) => {
      openModal({
         view: (
            <CashFlowConfirmationModal
               onConfirm={(generateCashFlow) => processReceive(data, generateCashFlow)}
               onCancel={closeModal}
            />
         ),
         customSize: '400px',
      });
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
            const response = await api.get(`/accounts-receivable/${account.id}`);

            if (!response) {
               throw new Error(`Error fetching account details: ${response}`);
            }

            const data = await response.data;

            setValue('id', account.id);
            setValue('discount', formatCurrency(data.discount || 0));
            setValue('fine', formatCurrency(data.fine));
            setValue('interest', formatCurrency(data.interest || 0));
            setValue('paymentDate', new Date());
            setValue('value', formatCurrency(data.value || 0));
            setValue('costCenterId', data.costCenter?.id || '');
         } catch (err) {
            console.error('Error fetching account details:', err);

            setValue('id', account.id);
            setValue('discount', moneyMask('R$ 0,00'));
            setValue('fine', 'R$ 0,00');
            setValue('interest', moneyMask('R$ 0,00'));
            setValue('paymentDate', new Date());
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
               <p className="text-lg font-semibold">{account.customerName}</p>
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

         <hr className="my-3 md:col-span-3" />

         <InputField
            label="Valor"
            placeholder="Valor"
            type="text"
            register={register('value')}
            error={errors.value?.message}
         />

         <InputField
            label="Desconto"
            placeholder="R$ 0,00"
            type="text"
            register={register('discount')}
            error={errors.discount?.message}
            onChange={(e) => {
               const value = moneyMask(e.target.value);
               setValue('discount', value);
            }}
         />

         <InputField
            label="Multa"
            placeholder="R$ 0,00"
            type="text"
            register={register('fine')}
            error={errors.fine?.message}
            onChange={(e) => {
               const value = moneyMask(e.target.value);
               setValue('fine', value);
            }}
         />

         <InputField
            label="Juros"
            placeholder="R$ 0,00"
            type="text"
            register={register('interest')}
            error={errors.interest?.message}
            onChange={(e) => {
               const value = moneyMask(e.target.value);
               setValue('interest', value);
            }}
         />

         <div className="md:col-span-2">
            <InputField
               label="Observação"
               placeholder="Observação"
               type="text"
               register={register('observation')}
               error={errors.observation?.message}
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
               <span>{loading ? 'Salvando...' : 'Receber'}</span>
            </Button>
         </div>
      </form>
   );
};
