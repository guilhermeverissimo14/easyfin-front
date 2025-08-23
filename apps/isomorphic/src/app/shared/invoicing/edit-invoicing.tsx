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
import { adjustToBrazilTimezone, formatCurrency, moneyMask } from '@/utils/format';
import { DatePicker } from '@core/ui/datepicker';
import { OptionsSelect, IInvoice } from '@/types';
import { LoadingSpinner } from '@/components/loading-spinner';

const invoiceSchema = z.object({
   invoiceNumber: z.string().nonempty('Número da fatura não pode ser vazio'),
   customerId: z.string().nonempty('Cliente não pode ser vazio'),
   paymentConditionId: z.string().nonempty('Condição de pagamento não pode ser vazia'),
   issueDate: z.date({
      required_error: "Data de emissão é obrigatória",
      invalid_type_error: "Data inválida",
   }),
   serviceValue: z.string().nonempty('Valor do serviço não pode ser vazio'),
   bankAccountId: z.string().optional(),
   costCenterId: z.string().optional(),
   notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface EditInvoiceProps {
   getInvoices: () => void;
   invoiceId: string;
}

interface Customer {
   id: string;
   name: string;
   retIss: boolean;
}

export const EditInvoice = ({ getInvoices, invoiceId }: EditInvoiceProps) => {
   const [loading, setLoading] = useState(false);
   const [fetchingInvoice, setFetchingInvoice] = useState(true);
   const { closeModal } = useModal();
   const [customers, setCustomers] = useState<OptionsSelect[]>([]);
   const [customersData, setCustomersData] = useState<Customer[]>([]);
   const [paymentConditions, setPaymentConditions] = useState<OptionsSelect[]>([]);
   const [bankAccounts, setBankAccounts] = useState<OptionsSelect[]>([]);
   const [costCenters, setCostCenters] = useState<OptionsSelect[]>([]);
   const [selectedCustomerRetIss, setSelectedCustomerRetIss] = useState<boolean>(false);
   const [initialDataLoaded, setInitialDataLoaded] = useState(false);
   const [invoiceData, setInvoiceData] = useState<IInvoice | null>(null);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const customersResponse = await api.get('/customers');
            setCustomersData(customersResponse.data);
            setCustomers(customersResponse.data.map((customer: Customer) => ({
               label: customer.name,
               value: customer.id
            })));

            const paymentConditionsResponse = await api.get('/payment-terms');
            setPaymentConditions(paymentConditionsResponse.data.map((condition: { condition: string, id: string, description: string }) => ({
               label: `${condition.description} - (${condition.condition.split(',').map(s => s.trim()).join(', ')})`,
               value: condition.id
            })));

            const bankAccountsResponse = await api.get('/bank-accounts');
            setBankAccounts(bankAccountsResponse.data.map((account: {bank:string, agency:string, account:number, id:string}) => ({
               label: `${account.bank} - Agência ${account.agency} - CC ${account.account}`,
               value: account.id
            })));

            const costCentersResponse = await api.get('/cost-centers');
            setCostCenters(costCentersResponse.data.map((center:{name:string, id:string}) => ({
               label: center.name,
               value: center.id
            })));

            setInitialDataLoaded(true);
         } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar dados necessários");
         }
      };

      fetchData();
   }, []);

   useEffect(() => {
      const fetchInvoice = async () => {
         try {
            setFetchingInvoice(true);
            const response = await api.get(`/invoices/${invoiceId}`);
            const data = await response.data;
            setInvoiceData(data as IInvoice);
         } catch (error) {
            console.error('Erro ao buscar fatura:', error);
            toast.error('Erro ao carregar dados da fatura');
         } finally {
            setFetchingInvoice(false);
         }
      };

      if (invoiceId) {
         fetchInvoice();
      }
   }, [invoiceId]);

   const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors },
      control,
      reset
   } = useForm<InvoiceFormData>({
      resolver: zodResolver(invoiceSchema),
      defaultValues: {
         invoiceNumber: '',
         customerId: '',
         paymentConditionId: '',
         issueDate: new Date(),
         serviceValue: '',
         bankAccountId: '',
         costCenterId: '',
         notes: '',
      }
   });

   // Reset form when invoiceData is loaded
   useEffect(() => {
      if (invoiceData) {
         reset({
            invoiceNumber: invoiceData.invoiceNumber || '',
            customerId: invoiceData.customer?.id || '',
            paymentConditionId: invoiceData.paymentCondition?.id || '',
            issueDate: invoiceData.issueDate ? new Date(invoiceData.issueDate) : new Date(),
            serviceValue: invoiceData.serviceValue ? formatCurrency(invoiceData.serviceValue) : '',
            bankAccountId: invoiceData.bankAccount?.id || '',
            costCenterId: invoiceData.costCenter?.id || '',
            notes: invoiceData.notes || '',
         });

         // set initial retain ISS flag based on fetched invoice
         setSelectedCustomerRetIss(invoiceData.retainsIss || false);
      }
   }, [invoiceData, reset]);

   const selectedCustomerId = watch('customerId');

   useEffect(() => {
      if (selectedCustomerId && customersData.length > 0 && initialDataLoaded) {
         const selectedCustomer = customersData.find(customer => customer.id === selectedCustomerId);
         if (selectedCustomer) {
            if (invoiceData?.customer?.id !== selectedCustomerId) {
               setSelectedCustomerRetIss(selectedCustomer.retIss);
            }
         }
      }
   }, [selectedCustomerId, customersData, initialDataLoaded, invoiceData]);

   useEffect(() => {
      if (invoiceData?.customer?.id && customersData.length > 0 && !initialDataLoaded) {
         const originalCustomer = customersData.find(customer => customer.id === invoiceData.customer.id);
         if (originalCustomer) {
            setSelectedCustomerRetIss(originalCustomer.retIss);
         }
      }
   }, [invoiceData?.customer?.id, customersData, initialDataLoaded]);

   const onSubmit = async (data: InvoiceFormData) => {
      if (!invoiceData) return;

      setLoading(true);

      try {
         const unmaskedServiceValue = data.serviceValue
            .replace(/[^\d,.-]/g, '')
            .replace(/\./g, '')
            .replace(',', '.');

         const payload = {
            invoiceNumber: data.invoiceNumber,
            customerId: data.customerId,
            paymentConditionId: data.paymentConditionId,
            issueDate: adjustToBrazilTimezone(data.issueDate),
            serviceValue: Number(unmaskedServiceValue),
            retainsIss: selectedCustomerRetIss,
            bankAccountId: data.bankAccountId || undefined,
            costCenterId: data.costCenterId || undefined,
            notes: data.notes || undefined,
         };

         await api.put(`/invoices/${invoiceData.id}`, payload);

         toast.success('Fatura atualizada com sucesso!');
         getInvoices();
         closeModal();
      } catch (error: any) {
         console.error('Erro ao atualizar fatura:', error);
         const errorMessage = error.response?.data?.message || 'Erro ao atualizar fatura';
         toast.error(errorMessage);
      } finally {
         setLoading(false);
      }
   };

   if (fetchingInvoice) {
      return (
         <div className="flex h-full w-full items-center justify-center p-10">
            <LoadingSpinner />
         </div>
      );
   }

   if (!invoiceData) {
      return <div className="p-4 text-gray-500">Nota fiscal não encontrada</div>;
   }

   return (
      <form className="flex w-[100%] flex-col items-center justify-center" onSubmit={handleSubmit(onSubmit)}>
         <div className="w-full space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <InputField
                  label="Número da Fatura"
                  placeholder="Ex: NF-001"
                  type="text"
                  register={register('invoiceNumber')}
                  error={errors.invoiceNumber?.message}
               />

               <Controller
                  control={control}
                  name="issueDate"
                  render={({ field: { onChange, value } }) => (
                     <DatePicker
                        label="Data de Emissão"
                        selected={value || new Date()}
                        onChange={onChange}
                        dateFormat="dd/MM/yyyy"
                        showMonthYearDropdown
                        minDate={new Date('2000-01-01')}
                        maxDate={new Date('2100-12-31')}
                        scrollableMonthYearDropdown
                        placeholderText="Selecione a data de emissão"
                        popperPlacement="bottom-end"
                        inputProps={{
                           variant: 'outline',
                           inputClassName: 'px-2 py-3 mt-1 h-auto [&_input]:text-ellipsis ring-0',
                        }}
                        className="flex-grow [&>label>span]:font-medium"
                        locale={ptBR}
                     />
                  )}
               />
            </div>

            <Controller
               control={control}
               name="customerId"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Cliente"
                     placeholder="Selecione o cliente"
                     options={customers}
                     onChange={onChange}
                     value={value || ''}
                     error={errors.customerId?.message}
                  />
               )}
            />

            {selectedCustomerId && (
               <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center gap-2">
                     <span className="text-sm font-medium text-gray-700">
                        Retenção de ISS para este cliente:
                     </span>
                     <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        selectedCustomerRetIss 
                           ? 'bg-red-100 text-red-800' 
                           : 'bg-green-100 text-green-800'
                     }`}>
                        {selectedCustomerRetIss ? 'Sim' : 'Não'}
                     </span>
                  </div>
               </div>
            )}

            <Controller
               control={control}
               name="paymentConditionId"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Condição de Pagamento"
                     placeholder="Selecione a condição de pagamento"
                     options={paymentConditions}
                     onChange={onChange}
                     value={value || ''}
                     error={errors.paymentConditionId?.message}
                  />
               )}
            />

            <InputField
               label="Valor do Serviço"
               placeholder="Informe o valor do serviço"
               type="text"
               register={register('serviceValue')}
               error={errors.serviceValue?.message}
               onChange={(e) => {
                  const value = moneyMask(e.target.value);
                  setValue('serviceValue', value);
               }}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <Controller
                  control={control}
                  name="bankAccountId"
                  render={({ field: { value, onChange } }) => (
                     <SelectField
                        label="Conta Bancária (Opcional)"
                        placeholder="Selecione a conta bancária"
                        options={bankAccounts}
                        onChange={onChange}
                        value={value || ''}
                        error={errors.bankAccountId?.message}
                     />
                  )}
               />

               <Controller
                  control={control}
                  name="costCenterId"
                  render={({ field: { value, onChange } }) => (
                     <SelectField
                        label="Centro de Custo (Opcional)"
                        placeholder="Selecione o centro de custo"
                        options={costCenters}
                        onChange={onChange}
                        value={value || ''}
                        error={errors.costCenterId?.message}
                     />
                  )}
               />
            </div>

            <div className="space-y-2">
               <label className="block text-sm font-medium text-gray-700">
                  Observações (Opcional)
               </label>
               <textarea
                  {...register('notes')}
                  placeholder="Observações adicionais sobre a fatura"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  rows={3}
               />
               {errors.notes && (
                  <p className="text-sm text-red-600">{errors.notes.message}</p>
               )}
            </div>

            <div className="flex gap-3">
               <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => closeModal()} 
                  className="w-full"
                  disabled={loading}
               >
                  Cancelar
               </Button>
               <Button disabled={loading} className="w-full" type="submit" size="lg">
                  <span>{loading ? 'Atualizando...' : 'Atualizar Fatura'}</span>
               </Button>
            </div>
         </div>
      </form>
   );
};