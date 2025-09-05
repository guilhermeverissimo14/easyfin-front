'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from 'react-toastify';

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { SelectField } from '@/components/input/select-field';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';
import { FilterParams } from '@/types';

const filterSchema = z.object({
   supplierId: z.string().optional(),
   costCenterId: z.string().optional(),
   status: z.string().optional(),
   paymentMethodId: z.string().optional(),
   documentDateStart: z.date().optional().nullable(),
   documentDateEnd: z.date().optional().nullable(),
   dueDateStart: z.date().optional().nullable(),
   dueDateEnd: z.date().optional().nullable(),
});

type FilterFormData = z.infer<typeof filterSchema>;

interface FilterAccountsPayableProps {
   getAccounts: (filters?: FilterParams) => void;
}

export const FilterAccountsPayable = ({ getAccounts }: FilterAccountsPayableProps) => {
   const [loading, setLoading] = useState(false);
   const [suppliers, setSuppliers] = useState<{label: string, value: string}[]>([]);
   const [costCenters, setCostCenters] = useState<{label: string, value: string}[]>([]);
   const [paymentMethods, setPaymentMethods] = useState<{label: string, value: string}[]>([]);
   const { closeModal } = useModal();

   const {
      handleSubmit,
      formState: { errors },
      control,
      reset
   } = useForm<FilterFormData>({
      resolver: zodResolver(filterSchema),
   });

   // Carregar dados para os selects
   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            
            // Buscar fornecedores da API
            const suppliersResponse = await api.get('/suppliers');
            setSuppliers(
               suppliersResponse.data.map((supplier: any) => ({
                  label: supplier.name,
                  value: supplier.id
               }))
            );
            
            // Buscar centros de custo da API
            const costCentersResponse = await api.get('/cost-centers');
            setCostCenters(
               costCentersResponse.data.map((center: any) => ({
                  label: center.name,
                  value: center.id
               }))
            );
            
            // Buscar métodos de pagamento da API
            const paymentMethodsResponse = await api.get('/payment-methods');
            setPaymentMethods(
               paymentMethodsResponse.data.map((method: any) => ({
                  label: method.name,
                  value: method.id
               }))
            );
         } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar dados para filtros");
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, []);

   const onSubmit = async (data: FilterFormData) => {
      setLoading(true);
      
      try {
         // Formatar as datas para o formato esperado pela API
         const filters: FilterParams = {};
         
         if (data.supplierId) filters.supplierId = data.supplierId;
         if (data.costCenterId) filters.costCenterId = data.costCenterId;
         if (data.status) filters.status = data.status;
         if (data.paymentMethodId) filters.paymentMethodId = data.paymentMethodId;
         
         if (data.documentDateStart) {
            filters.documentDateStart = data.documentDateStart.toISOString().split('T')[0];
         }
         
         if (data.documentDateEnd) {
            filters.documentDateEnd = data.documentDateEnd.toISOString().split('T')[0];
         }
         
         if (data.dueDateStart) {
            filters.dueDateStart = data.dueDateStart.toISOString().split('T')[0];
         }
         
         if (data.dueDateEnd) {
            filters.dueDateEnd = data.dueDateEnd.toISOString().split('T')[0];
         }
         
         // Chamar a função para buscar dados filtrados
         await getAccounts(filters);
         
         toast.success('Filtro aplicado com sucesso');
         closeModal();
      } catch (error) {
         console.error('Erro ao aplicar filtro:', error);
         toast.error('Não foi possível aplicar o filtro');
      } finally {
         setLoading(false);
      }
   };

   const statusOptions = [
      { label: 'Pendente', value: 'PENDING' },
      { label: 'Vencido', value: 'OVERDUE' },
      { label: 'Recebido', value: 'PAID' },
      { label: 'Cancelado', value: 'CANCELLED' }
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
                     options={suppliers}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.supplierId?.message}
                  />
               )}
            />
         </div>

         <div className="md:col-span-2">
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
         </div>

         <Controller
            control={control}
            name="status"
            render={({ field: { value, onChange } }) => (
               <SelectField
                  label="Situação"
                  placeholder="Selecione o status"
                  options={statusOptions}
                  onChange={(selected) => {
                     onChange(selected);
                  }}
                  value={value || ''}
                  error={errors.status?.message}
               />
            )}
         />

         <Controller
            control={control}
            name="paymentMethodId"
            render={({ field: { value, onChange } }) => (
               <SelectField
                  label="Método de Pagamento"
                  placeholder="Selecione o método de pagamento"
                  options={paymentMethods}
                  onChange={(selected) => {
                     onChange(selected);
                  }}
                  value={value || ''}
                  error={errors.paymentMethodId?.message}
               />
            )}
         />

         <Controller
            control={control}
            name="documentDateStart"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Data do Documento (Início)"
                  selected={value}
                  onChange={onChange}
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
            )}
         />

         <Controller
            control={control}
            name="documentDateEnd"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Data do Documento (Fim)"
                  selected={value}
                  onChange={onChange}
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
            )}
         />

         <Controller
            control={control}
            name="dueDateStart"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Data do Vencimento (Início)"
                  selected={value}
                  onChange={onChange}
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
            )}
         />

         <Controller
            control={control}
            name="dueDateEnd"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Data do Vencimento (Fim)"
                  selected={value}
                  onChange={onChange}
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
            )}
         />

         <div className="md:col-span-2 flex gap-2">
            <Button 
               type="button" 
               variant="outline" 
               className="w-full" 
               onClick={() => {
                  reset({
                     supplierId: '',
                     costCenterId: '',
                     status: '',
                     paymentMethodId: '',
                     documentDateStart: null,
                     documentDateEnd: null,
                     dueDateStart: null,
                     dueDateEnd: null
                  });
               }}
            >
               Limpar
            </Button>
            <Button 
               disabled={loading} 
               className="w-full" 
               type="submit" 
               size="lg"
            >
               <span>{loading ? 'Carregando...' : 'Pesquisar'}</span>
            </Button>
         </div>
      </form>
   );
};