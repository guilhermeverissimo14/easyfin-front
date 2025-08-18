'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { ptBR } from 'date-fns/locale';

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { adjustToBrazilTimezone, moneyMask } from '@/utils/format';
import { DatePicker } from '@core/ui/datepicker';

const bankAccountSchema = z.object({
   type: z.string().nonempty('Tipo de lançamento não pode ser vazio'),
   value: z.string().nonempty('Valor não pode ser vazio'),
   costCenterId: z.string().optional(),
   historic: z.string().nonempty('Histórico não pode ser vazio'),
   description: z.string().optional(),
   bankAccountId: z.string().optional(),
   cashBoxId: z.string().optional(),
   date: z.date({
      required_error: "Data do lançamento é obrigatória",
      invalid_type_error: "Data inválida",
   }),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface RegisterTransactionProps {
   getCashBook: () => void;
   bankAccountId?: string;
   cashBookId?: string;
   refreshTotals?: () => void;
   cashFlowMode?: string;
}

export const RegisterTransaction = ({ getCashBook, refreshTotals, bankAccountId, cashBookId, cashFlowMode }: RegisterTransactionProps) => {
   const [loading, setLoading] = useState(false);
   const { closeModal } = useModal();
   const [bankAccounts, setBankAccounts] = useState<{ label: string; value: string; details?: string }[]>([]);
   const [costCenters, setCostCenters] = useState([]);

   useEffect(() => {
      const fetchData = async () => {
         try {
            // Só buscar contas bancárias se estiver no modo BANK
            if (cashFlowMode === 'BANK') {
               const bankAccountsResponse = await api.get('/bank-accounts');

               const filterAccountSelected = bankAccountsResponse.data.filter((account:any) => {
                  return account.id === bankAccountId;
               });

               if (filterAccountSelected.length > 0) {
                  setBankAccounts([{
                     label: `${filterAccountSelected[0]?.bank} - Agência ${filterAccountSelected[0]?.agency} - CC ${filterAccountSelected[0]?.account}`,
                     value: filterAccountSelected[0]?.id,
                     details: filterAccountSelected[0]
                  }]);
               }
            }

            const costCentersResponse = await api.get('/cost-centers');
            setCostCenters(costCentersResponse.data.map((center: any) => ({
               label: center.name,
               value: center.id
            })));
         } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar dados necessários");
         }
      };

      fetchData();
   }, [cashFlowMode, bankAccountId, cashBookId]);

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
      control,
      reset
   } = useForm<BankAccountFormData>({
      resolver: zodResolver(bankAccountSchema),
      defaultValues: {
         date: new Date(),
         bankAccountId: bankAccountId || "",
         cashBoxId: cashBookId || "",
      }
   });

   const onSubmit = async (data: BankAccountFormData) => {
      setLoading(true);

      try {
         const unmaskedValue = data.value
            .replace(/[^\d,.-]/g, '')
            .replace(/\./g, '')
            .replace(',', '.');

         const mappedType = data.type === 'D' ? 'DEBIT' : 'CREDIT';

         let payload;
         if (cashFlowMode === 'BANK') {
            payload = {
               type: mappedType,
               value: Number(unmaskedValue),
               historic: data.historic,
               description: data.description || '',
               costCenterId: data.costCenterId || '',
               bankAccountId: data.bankAccountId,
               date: adjustToBrazilTimezone(data.date || new Date()),
            };
         } else if (cashFlowMode === 'CASH') {
            payload = {
               type: mappedType,
               value: Number(unmaskedValue),
               historic: data.historic,
               description: data.description || '',
               costCenterId: data.costCenterId || '',
               cashBoxId: cashBookId,
               date: adjustToBrazilTimezone(data.date || new Date()),
            };
         }

         await api.post('/cash-flow', payload);

         toast.success('Lançamento registrado com sucesso!');
         getCashBook();
         if (refreshTotals) refreshTotals();
         reset();
         closeModal();
      } catch (error: any) {
         console.error('Erro ao registrar lançamento:', error);
         const errorMessage = error.response?.data?.message || 'Erro ao registrar lançamento';
         toast.error(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   const accountTypeOptions = [
      { label: 'Débito', value: 'D' },
      { label: 'Crédito', value: 'C' },
   ];

   return (
      <form className="flex w-[100%] flex-col items-center justify-center" onSubmit={handleSubmit(onSubmit)}>
         <div className="w-full space-y-5">

            {cashFlowMode === 'BANK' && bankAccounts && bankAccounts.length > 0 && (
               <div className="flex flex-col items-start justify-center space-y-1">
                  <span className="font-bold">Conta bancária selecionada:</span>
                  <span className="font-medium text-gray-700">{bankAccounts[0]?.label}</span>
               </div>
            )}

            {cashFlowMode === 'CASH' && (
               <div className="flex flex-col items-start justify-center space-y-1">
                  <span className="font-bold">Caixa Geral</span>
                  <span className="font-medium text-gray-700">Lançamentos em dinheiro</span>
               </div>
            )}

            <Controller
               control={control}
               name="date"
               render={({ field: { onChange, value } }) => (
                  <DatePicker
                     label="Data do Lançamento"
                     selected={value || new Date()}
                     onChange={onChange}
                     dateFormat="dd/MM/yyyy"
                     showMonthYearDropdown
                     minDate={new Date('2000-01-01')}
                     maxDate={new Date('2100-12-31')}
                     scrollableMonthYearDropdown
                     placeholderText="Selecione a data do lançamento"
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
               name="type"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Tipo"
                     placeholder="Selecione o tipo do lançamento"
                     options={accountTypeOptions}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.type?.message}
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

            <InputField
               label="Histórico"
               placeholder="Ex: Pagamento, Transferência, Recebimento..."
               type="text"
               register={register('historic')}
               error={errors.historic?.message}
            />

            <InputField
               label="Descrição"
               placeholder="Detalhes adicionais (opcional)"
               type="text"
               register={register('description')}
               error={errors.description?.message}
            />

            <Controller
               control={control}
               name="costCenterId"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Centro de Custo"
                     placeholder="Selecione o centro de custo"
                     options={costCenters}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.costCenterId?.message}
                  />
               )}
            />

            <Button disabled={loading} className="w-full" type="submit" size="lg">
               <span>{loading ? 'Registrando...' : 'Cadastrar'}</span>
            </Button>
         </div>
      </form>
   );
};