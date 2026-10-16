'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'rizzui';

import { api } from '@/service/api';
import { apiCall } from '@/helpers/apiHelper';
import { useModal } from '../modal-views/use-modal';
import { SelectField } from '@/components/input/select-field';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';

type FilterAccountsPayableFormData = {
   supplierId: string;
   costCenterId: string;
   status: string;
   paymentMethodId: string;
   documentDateStart: string;
   documentDateEnd: string;
   dueDateStart: string;
   dueDateEnd: string;
};

type FilterAccountsPayableProps = {
   onFilter: (filters: Record<string, any>) => void;
   currentFilters?: Partial<FilterAccountsPayableFormData>;
};

export const FilterAccountsPayable = ({ 
   onFilter,
   currentFilters 
}: FilterAccountsPayableProps) => {
   const { register, setValue, watch } = useForm<FilterAccountsPayableFormData>({
      defaultValues: {
         supplierId: currentFilters?.supplierId || '',
         costCenterId: currentFilters?.costCenterId || '',
         status: currentFilters?.status || '',
         paymentMethodId: currentFilters?.paymentMethodId || '',
         documentDateStart: currentFilters?.documentDateStart || '',
         documentDateEnd: currentFilters?.documentDateEnd || '',
         dueDateStart: currentFilters?.dueDateStart || '',
         dueDateEnd: currentFilters?.dueDateEnd || '',
      }
   });

   const formData = watch();
   const { closeModal } = useModal();

   const [suppliers, setSuppliers] = useState<{label: string, value: string}[]>([]);
   const [costCenters, setCostCenters] = useState<{label: string, value: string}[]>([]);
   const [paymentMethods, setPaymentMethods] = useState<{label: string, value: string}[]>([]);

   const stringToDate = (dateString: string): Date | null => {
      if (!dateString) return null;
      const [year, month, day] = dateString.split('-');
      return new Date(Number(year), Number(month) - 1, Number(day));
   };

   const dateToString = (date: Date | null): string => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
   };

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [suppliersRes, costCentersRes, paymentMethodsRes] = await Promise.all([
               apiCall(() => api.get('/suppliers')),
               apiCall(() => api.get('/cost-centers')),
               apiCall(() => api.get('/payment-methods')),
            ]);

            if (suppliersRes?.data) {
               setSuppliers(suppliersRes.data.map((supplier: any) => ({
                  label: supplier.name,
                  value: supplier.id
               })).sort((a: any, b: any) => String(a.label ?? '').localeCompare(String(b.label ?? ''), 'pt-BR', { sensitivity: 'base' })));
            }

            if (costCentersRes?.data) {
               setCostCenters(costCentersRes.data.map((center: any) => ({
                  label: center.name,
                  value: center.id
               })));
            }

            if (paymentMethodsRes?.data) {
               setPaymentMethods(paymentMethodsRes.data.map((method: any) => ({
                  label: method.name,
                  value: method.id
               })));
            }
         } catch (error) {
            console.error("Erro ao carregar dados:", error);
         }
      };

      fetchData();
   }, []);

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const filters: Record<string, any> = { page: 1, limit: 10 };

      const currentValues = formData;

      Object.entries(currentValues).forEach(([key, value]) => {
         if (value && value !== "") {
            filters[key] = value;
         }
      });

      onFilter(filters);
      closeModal();
   };

   const handleClear = () => {
      setValue('supplierId', '');
      setValue('costCenterId', '');
      setValue('status', '');
      setValue('paymentMethodId', '');
      setValue('documentDateStart', '');
      setValue('documentDateEnd', '');
      setValue('dueDateStart', '');
      setValue('dueDateEnd', '');
      onFilter({ page: 1, limit: 10 });
   };

   const statusOptions = [
      { label: 'Todos', value: '' },
      { label: 'Aberto', value: 'PENDING' },
      { label: 'Vencido', value: 'OVERDUE' },
      { label: 'Pago', value: 'PAID' },
   ];

   return (
      <form 
         className="grid w-full grid-cols-1 gap-4 md:grid-cols-2" 
         onSubmit={handleSubmit}
      >
         <div className="md:col-span-2">
            <SelectField
               label="Fornecedor"
               placeholder="Selecione o Fornecedor"
               options={[
                  { label: 'Todos os fornecedores', value: '' },
                  ...suppliers
               ]}
               onChange={(selected) => setValue('supplierId', selected)}
               value={formData.supplierId}
            />
         </div>

         <div className="md:col-span-2">
            <SelectField
               label="Centro de Custo"
               placeholder="Selecione o centro de custo"
               options={[
                  { label: 'Todos os centros de custo', value: '' },
                  ...costCenters
               ]}
               onChange={(selected) => setValue('costCenterId', selected)}
               value={formData.costCenterId}
            />
         </div>

         <SelectField
            label="Situação"
            placeholder="Selecione o status"
            options={statusOptions}
            onChange={(selected) => setValue('status', selected)}
            value={formData.status}
         />

         <SelectField
            label="Método de Pagamento"
            placeholder="Selecione o método de pagamento"
            options={[
               { label: 'Todos os métodos', value: '' },
               ...paymentMethods
            ]}
            onChange={(selected) => setValue('paymentMethodId', selected)}
            value={formData.paymentMethodId}
         />

         <DatePicker
            label="Data do Documento (Início)"
            selected={stringToDate(formData.documentDateStart)}
            onChange={(date) => setValue('documentDateStart', dateToString(date))}
            dateFormat="dd/MM/yyyy"
            showMonthYearDropdown
            minDate={new Date('2000-02-01')}
            maxDate={new Date('2100-01-01')}
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

         <DatePicker
            label="Data do Documento (Fim)"
            selected={stringToDate(formData.documentDateEnd)}
            onChange={(date) => setValue('documentDateEnd', dateToString(date))}
            dateFormat="dd/MM/yyyy"
            showMonthYearDropdown
            minDate={new Date('2000-02-01')}
            maxDate={new Date('2100-01-01')}
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

         <DatePicker
            label="Data do Vencimento (Início)"
            selected={stringToDate(formData.dueDateStart)}
            onChange={(date) => setValue('dueDateStart', dateToString(date))}
            dateFormat="dd/MM/yyyy"
            showMonthYearDropdown
            minDate={new Date('2000-02-01')}
            maxDate={new Date('2100-01-01')}
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

         <DatePicker
            label="Data do Vencimento (Fim)"
            selected={stringToDate(formData.dueDateEnd)}
            onChange={(date) => setValue('dueDateEnd', dateToString(date))}
            dateFormat="dd/MM/yyyy"
            showMonthYearDropdown
            minDate={new Date('2000-02-01')}
            maxDate={new Date('2100-01-01')}
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

         <div className="md:col-span-2 flex gap-2">
            <Button 
               type="button" 
               variant="outline" 
               className="w-full" 
               onClick={handleClear}
            >
               Limpar Filtros
            </Button>
            <Button 
               className="w-full" 
               type="submit" 
               size="lg"
            >
               Aplicar Filtros
            </Button>
         </div>
      </form>
   );
};