import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useModal } from "../modal-views/use-modal";
import { api } from "@/service/api";
import { apiCall } from "@/helpers/apiHelper";
import { Button } from 'rizzui';
import { SelectField } from '@/components/input/select-field';
import { InputField } from '@/components/input/input-field';
import { DatePicker } from '@core/ui/datepicker';
import { ptBR } from 'date-fns/locale';
import { CustomerType } from '@/types';

type FilterInvoicingFormData = {
   invoiceNumber: string;
   customerId: string;
   customer: string;
   bankAccountId: string;
   paymentConditionId: string;
   costCenterId: string;
   issueDate: string;
   issueDateStart: string;
   issueDateEnd: string;
   startDate: string;
   endDate: string;
   orderBy: string;
   order: string;
};

type FilterInvoicingAdvancedProps = {
   onFilter: (filters: Record<string, any>) => void;
   currentFilters?: Partial<FilterInvoicingFormData>;
};

export const FilterInvoicingAdvanced = ({
   onFilter,
   currentFilters,
}: FilterInvoicingAdvancedProps) => {

   const { register, setValue, watch, getValues} = useForm<FilterInvoicingFormData>({
      defaultValues: {
         invoiceNumber: currentFilters?.invoiceNumber || "",
         customerId: currentFilters?.customerId || "",
         customer: currentFilters?.customer || "",
         bankAccountId: currentFilters?.bankAccountId || "",
         paymentConditionId: currentFilters?.paymentConditionId || "",
         costCenterId: currentFilters?.costCenterId || "",
         issueDate: currentFilters?.issueDate || "",
         issueDateStart: currentFilters?.issueDateStart || "",
         issueDateEnd: currentFilters?.issueDateEnd || "",
         startDate: currentFilters?.startDate || "",
         endDate: currentFilters?.endDate || "",
         orderBy: currentFilters?.orderBy || "",
         order: currentFilters?.order || "",
      }
   });

   const formData = watch();
   const { closeModal } = useModal();

   const [costCenters, setCostCenters] = useState<{ label: string; value: string }[]>([]);
   const [customers, setCustomers] = useState<{ label: string; value: string }[]>([]);
   const [bankAccounts, setBankAccounts] = useState<{ label: string; value: string }[]>([]);
   const [paymentConditions, setPaymentConditions] = useState<{ label: string; value: string }[]>([]);

   const stringToDate = (dateString: string): Date | null => {
   if (!dateString) return null;
   // Adiciona o timezone local para evitar conversão UTC
   const [year, month, day] = dateString.split('-');
   return new Date(Number(year), Number(month) - 1, Number(day));
};

const dateToString = (date: Date | null): string => {
   if (!date) return '';
   // Usa getFullYear, getMonth e getDate para pegar a data local
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, '0');
   const day = String(date.getDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
};

   useEffect(() => {
      const fetchFiltersData = async () => {
         try {
            const [costCentersRes, customersRes, bankAccountsRes, paymentConditionsRes] = await Promise.all([
               apiCall(() => api.get('/cost-centers')),
               apiCall(() => api.get<CustomerType[]>('/customers')),
               apiCall(() => api.get('/bank-accounts')),
               apiCall(() => api.get('/payment-terms')),
            ]);

            if (costCentersRes?.data) {
               setCostCenters(costCentersRes.data.map((item: any) => ({
                  label: item.name,
                  value: item.id
               })));
            }

            if (customersRes?.data) {
               setCustomers(customersRes.data.map((item: CustomerType) => ({
                  label: item.name,
                  value: item.id
               })).sort((a: any, b: any) => String(a.label ?? '').localeCompare(String(b.label ?? ''), 'pt-BR', { sensitivity: 'base' })));
            }

            if (bankAccountsRes?.data) {
               setBankAccounts(bankAccountsRes.data.map((item: any) => ({
                  label: `${item.bank} - Ag: ${item.agency} - Conta: ${item.account}`,
                  value: item.id
               })));
            }

            if (paymentConditionsRes?.data) {
               setPaymentConditions(paymentConditionsRes.data.map((item: any) => ({
                  label: item.description || item.name,
                  value: item.id
               })).sort((a: any, b: any) => String(a.label ?? '').localeCompare(String(b.label ?? ''), 'pt-BR', { sensitivity: 'base' })));
            }
         } catch (error) {
            console.error('Erro ao buscar dados dos filtros:', error);
         }
      };

      fetchFiltersData();
   }, []);

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const filters: Record<string, any> = { page: 1, limit: 10 };

       const currentValues = getValues();

      Object.entries(currentValues).forEach(([key, value]) => {
         if (value && value !== "") {
            filters[key] = value;
         }
      });

      onFilter(filters);
      closeModal();
   };

   const handleClear = () => {
      setValue('invoiceNumber', '');
      setValue('customerId', '');
      setValue('customer', '');
      setValue('bankAccountId', '');
      setValue('paymentConditionId', '');
      setValue('costCenterId', '');
      setValue('issueDate', '');
      setValue('issueDateStart', '');
      setValue('issueDateEnd', '');
      setValue('startDate', '');
      setValue('endDate', '');
      setValue('orderBy', '');
      setValue('order', '');
      onFilter({ page: 1, limit: 10 });
   };

   return (
      <form
         onSubmit={handleSubmit}
         className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
         <InputField
            label="Número da Nota Fiscal"
            placeholder="Número da nota fiscal"
            type="text"
            register={register('invoiceNumber')}
         />

         <div>
            <SelectField
               label="Cliente"
               placeholder="Filtrar por cliente"
               options={[
                  { label: 'Todos os clientes', value: '' },
                  ...customers
               ]}
               onChange={(selected) => {
                  setValue('customerId', selected);
               }}
               value={formData.customerId}
            />
         </div>

         <div>
            <SelectField
               label="Conta Bancária"
               placeholder="Filtrar por conta bancária"
               options={[
                  { label: 'Todas as contas', value: '' },
                  ...bankAccounts
               ]}
               onChange={(selected) => {
                  setValue('bankAccountId', selected);
               }}
               value={formData.bankAccountId}
            />
         </div>

         <div>
            <SelectField
               label="Condição de Pagamento"
               placeholder="Filtrar por condição de pagamento"
               options={[
                  { label: 'Todas as condições', value: '' },
                  ...paymentConditions
               ]}
               onChange={(selected) => {
                  setValue('paymentConditionId', selected);
               }}
               value={formData.paymentConditionId}
            />
         </div>

         <div>
            <SelectField
               label="Centro de Custo"
               placeholder="Filtrar por centro de custo"
               options={[
                  { label: 'Todos os centros de custo', value: '' },
                  { label: 'Sem centro de custo', value: 'empty' },
                  ...costCenters
               ]}
               onChange={(selected) => {
                  setValue('costCenterId', selected);
               }}
               value={formData.costCenterId}
            />
         </div>

         <div>
            <DatePicker
               label="Data de Emissão Específica"
               selected={stringToDate(formData.issueDate)}
               onChange={(date) => {
                  setValue('issueDate', dateToString(date));
               }}
               dateFormat="dd/MM/yyyy"
               minDate={new Date('1900-01-01')}
               maxDate={new Date('2100-01-01')}
               showMonthYearDropdown
               scrollableMonthYearDropdown
               placeholderText="Data específica de emissão"
               popperPlacement="bottom-end"
               inputProps={{
                  variant: 'outline',
                  inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
               }}
               className="flex-grow [&>label>span]:font-medium"
               locale={ptBR}
            />
         </div>

         <div>
            <DatePicker
               label="Data Início do Período"
               selected={stringToDate(formData.startDate)}
               onChange={(date) => {
                  setValue('startDate', dateToString(date));
               }}
               dateFormat="dd/MM/yyyy"
               minDate={new Date('1900-01-01')}
               maxDate={new Date('2100-01-01')}
               showMonthYearDropdown
               scrollableMonthYearDropdown
               placeholderText="Data inicial do período"
               popperPlacement="bottom-end"
               inputProps={{
                  variant: 'outline',
                  inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
               }}
               className="flex-grow [&>label>span]:font-medium"
               locale={ptBR}
            />
         </div>

         <div>
            <DatePicker
               label="Data Fim do Período"
               selected={stringToDate(formData.endDate)}
               onChange={(date) => {
                  setValue('endDate', dateToString(date));
               }}
               dateFormat="dd/MM/yyyy"
               minDate={new Date('1900-01-01')}
               maxDate={new Date('2100-01-01')}
               showMonthYearDropdown
               scrollableMonthYearDropdown
               placeholderText="Data final do período"
               popperPlacement="bottom-end"
               inputProps={{
                  variant: 'outline',
                  inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
               }}
               className="flex-grow [&>label>span]:font-medium"
               locale={ptBR}
            />
         </div>

         <div className="md:col-span-2 flex flex-row gap-4">
            <Button
               type="button"
               className="flex-1"
               variant="outline"
               onClick={handleClear}
            >
               Limpar Filtros
            </Button>
            <Button
               className="flex-1"
               type="submit"
            >
               Aplicar Filtros
            </Button>
         </div>
      </form>
   );
};
