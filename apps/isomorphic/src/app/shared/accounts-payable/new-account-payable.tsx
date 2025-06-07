'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from 'react-toastify';

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { adjustToBrazilTimezone, moneyMask } from '@/utils/format';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';

const newAccountPayableSchema = z.object({
   supplierId: z.string().nonempty('Fornecedor não pode ser vazio'),
   documentDate: z.date().nullable().optional(),
   dueDate: z.date().nullable().optional(),
   value: z.string().nonempty('Valor não pode ser vazio'),
   documentNumber: z.string().nonempty('Número do documento não pode ser vazio'),
   observation: z.string().optional(),
   costCenterId: z.string().nonempty('Centro de custo não pode ser vazio'),
   plannedPaymentMethod: z.string().nonempty('Método de pagamento não pode ser vazio'),
});

type NewAccountPayableFormData = z.infer<typeof newAccountPayableSchema>;

interface NewAccountPayableProps {
   getAccounts: () => void;
}

export const NewAccountPayable = ({ getAccounts }: NewAccountPayableProps) => {
   const [loading, setLoading] = useState(false);
   const [suppliers, setSuppliers] = useState([]);
   const [costCenters, setCostCenters] = useState([]);
   const [paymentMethods, setPaymentMethods] = useState([]);
   const { closeModal } = useModal();

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
      control,
      reset
   } = useForm<NewAccountPayableFormData>({
      resolver: zodResolver(newAccountPayableSchema),
      defaultValues: {
         documentDate: new Date(),
         dueDate: new Date(),
      }
   });

   useEffect(() => {
      const fetchData = async () => {
         try {
            const suppliersResponse = await api.get('/suppliers');
            setSuppliers(suppliersResponse.data.map((supplier: any) => ({
               label: supplier.name,
               value: supplier.id
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

   const onSubmit = async (data: NewAccountPayableFormData) => {
      setLoading(true);
      
      try {
         const unmaskedValue = data.value
            .replace(/[^\d,.-]/g, '') 
            .replace(/\./g, '')     
            .replace(',', '.');    

         console.log('Dados do formulário:', Number(unmaskedValue));
         const formattedData = {
            supplierId: data.supplierId,
            documentNumber: data.documentNumber || "",
            plannedPaymentMethod: data.plannedPaymentMethod || "",
            documentDate: adjustToBrazilTimezone(data.documentDate ? data.documentDate : new Date()),
            dueDate: adjustToBrazilTimezone(data.dueDate ? data.dueDate : new Date()),
            value: Number(unmaskedValue),
            costCenterId: data.costCenterId || "",
            observation: data.observation || ""
         };

         await api.post('/accounts-payable', formattedData);
         
         toast.success('Conta lançada com sucesso!');
         getAccounts();
         reset();
         closeModal(); 
         
      } catch (error: any) {
         console.error('Erro ao lançar conta:', error);
         const errorMessage = error.response?.data?.message || 'Erro ao lançar conta a pagar';
         toast.error(errorMessage);
      } finally {
         setLoading(false);
      }
   };

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
                  label="Data do documento"
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
                  label="Vencimento"
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
               <span>{loading ? 'Carregando...' : 'Cadastrar'}</span>
            </Button>
         </div>
      </form>
   );
};

function unformatMone(value: string) {
   throw new Error('Function not implemented.');
}
