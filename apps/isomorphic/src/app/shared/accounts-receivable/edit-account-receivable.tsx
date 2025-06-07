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
import { adjustToBrazilTimezone, formatCurrency, moneyMask } from '@/utils/format';
import { IAccountsReceivable } from '@/types';

const editAccountReceivableSchema = z.object({
   customerId: z.string().nonempty('Cliente não pode ser vazio'),
   documentNumber: z.string().optional(),
   documentDate: z.date().optional().nullable(),
   dueDate: z.date().optional().nullable(),
   discount: z.string().optional(),
   fine: z.string().optional(),
   interest: z.string().optional(),
   observation: z.string().optional(),
   costCenterId: z.string().optional(),
   plannedPaymentMethod: z.string().optional(),
   value: z.string().nonempty('Valor não pode ser vazio'),
});

type EditAccountFormData = z.infer<typeof editAccountReceivableSchema>;

interface EditAccountReceivableProps {
   getAccounts: () => void;
   account: IAccountsReceivable;
}

export const EditAccountReceivable = ({ getAccounts, account }: EditAccountReceivableProps) => {
   const [loading, setLoading] = useState(false);
   const [customers, setCustomers] = useState([]);
   const [costCenters, setCostCenters] = useState([]);
   const [paymentMethods, setPaymentMethods] = useState([]);
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

   useEffect(() => {
      const fetchData = async () => {
         try {
            const customersResponse = await api.get('/customers');
            setCustomers(customersResponse.data.map((customer: any) => ({
               label: customer.name,
               value: customer.id
            })));

            const costCentersResponse = await api.get('/cost-centers');
            setCostCenters(costCentersResponse.data.map((center: any) => ({
               label: center.name,
               value: center.id
            })));

            const paymentMethodsResponse = await api.get('/payment-methods');
            setPaymentMethods(paymentMethodsResponse.data.map((method: any) => ({
               label: method.name,
               value: method.id
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
            
            setValue('customerId', data.customer?.id || '');
            setValue('documentNumber', data.documentNumber);
            setValue('documentDate', data.documentDate ? new Date(data.documentDate) : null);
            setValue('dueDate', data.dueDate ? new Date(data.dueDate) : null);
            setValue('value', formatCurrency(data.value));
            setValue('discount', formatCurrency(data.discount || 0));
            setValue('fine', formatCurrency(data.fine || 0));
            setValue('interest', formatCurrency(data.interest || 0));
            setValue('costCenterId', data.costCenter?.id || '');
            setValue('plannedPaymentMethod', data.plannedPaymentMethod?.id || '');
            setValue('observation', data.observation || '');
         } catch (err) {
            console.error('Error fetching account details:', err);
            // If API call fails, use the data passed to component
            setValue('customerId', account.customerId || '');
            setValue('documentNumber', account.documentNumber || '');
            setValue('documentDate', account.documentDate ? new Date(account.documentDate) : null);
            setValue('dueDate', account.dueDate ? new Date(account.dueDate) : null);
            setValue('value', moneyMask(String(account.value || 0)));
            setValue('observation', account.observation || '');
         } finally {
            setLoading(false);
         }
      };

      fetchAccountDetails();
   }, [account, setValue]);

   const onSubmit = async (data: EditAccountFormData) => {
      setLoading(true);
      try {
         const unmaskedValue = data.value
            .replace(/[^\d,.-]/g, '')
            .replace(/\./g, '')
            .replace(',', '.');

         const unmaskedDiscount = data.discount
            ? data.discount.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
            : '0';

         const unmaskedFine = data.fine
            ? data.fine.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
            : '0';

         const unmaskedInterest = data.interest
            ? data.interest.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
            : '0';

         const formattedData = {
            customerId: data.customerId,
            documentNumber: data.documentNumber || "",
            documentDate: adjustToBrazilTimezone(data.documentDate ? data.documentDate : new Date()),
            dueDate: adjustToBrazilTimezone(data.dueDate ? data.dueDate : new Date()),
            value: Number(unmaskedValue),
            discount: Number(unmaskedDiscount),
            fine: Number(unmaskedFine),
            interest: Number(unmaskedInterest),
            costCenterId: data.costCenterId || "",
            plannedPaymentMethod: data.plannedPaymentMethod || "",
            observation: data.observation || ""
         };

         await api.put(`/accounts-receivable/${account.id}`, formattedData);
         
         toast.success('Conta a receber atualizada com sucesso!');
         getAccounts();
         closeModal();
      } catch (error: any) {
         console.error('Erro ao atualizar conta:', error);
         const errorMessage = error.response?.data?.message || 'Erro ao atualizar conta a receber';
         toast.error(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   return (
      <form className="grid w-full grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
         <div className="md:col-span-2">
            <div className="flex items-center">
               <p className="text-lg font-semibold">{account.customerName}</p>
            </div>
         </div>

         <div className="md:col-span-2">
            <Controller
               control={control}
               name="customerId"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Cliente"
                     placeholder="Selecione o Cliente"
                     options={customers}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.customerId?.message}
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
                  options={paymentMethods}
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
                  maxDate={new Date('2100-01-01')}
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

         <InputField
            label="Multa"
            placeholder="Valor da multa, se houver"
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
            placeholder="Valor do juros, se houver"
            type="text"
            register={register('interest')}
            error={errors.interest?.message}
            onChange={(e) => {
               const value = moneyMask(e.target.value);
               setValue('interest', value);
            }}
         />

         <InputField
            label="Desconto"
            placeholder="Valor do desconto, se houver"
            type="text"
            register={register('discount')}
            error={errors.discount?.message}
            onChange={(e) => {
               const value = moneyMask(e.target.value);
               setValue('discount', value);
            }}
         />

         <div className="md:col-span-2">
            <InputField
               label="Observação"
               placeholder="Informação adicional sobre a conta"
               type="text"
               register={register('observation')}
               error={errors.observation?.message}
               maxLength={200}
            />
         </div>

         <div className="md:col-span-2">
            <Button disabled={loading} className="w-full" type="submit" size="lg">
               <span>{loading ? 'Salvando...' : 'Atualizar'}</span>
            </Button>
         </div>
      </form>
   );
};