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
import { formatCurrency, moneyMask } from '@/utils/format';
import { IAccountsPayable } from '@/types';

const editAccountPayableSchema = z.object({
   supplierId: z.string().nonempty('Fornecedor não pode ser vazio'),
   documentDate: z.date().nullable().optional(),
   dueDate: z.date().nullable().optional(),
   value: z.string().nonempty('Valor não pode ser vazio'),
   documentNumber: z.string().nonempty('Número do documento não pode ser vazio'),
   observation: z.string().optional(),
   costCenterId: z.string().nonempty('Centro de custo não pode ser vazio'),
   plannedPaymentMethod: z.string().nonempty('Método de pagamento não pode ser vazio'),
   discount: z.string().optional(),
   fine: z.string().optional(),
   interest: z.string().optional(),
});

type EditAccountPayableFormData = z.infer<typeof editAccountPayableSchema>;

interface EditAccountPayableProps {
   getAccounts: () => void;
   account: IAccountsPayable;
}

export const EditAccountPayable = ({ getAccounts, account }: EditAccountPayableProps) => {
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
   } = useForm<EditAccountPayableFormData>({
      resolver: zodResolver(editAccountPayableSchema),
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

   useEffect(() => {

      const fetchAccountDetails = async () => {

         try {
            setLoading(true);
            const response = await api.get(`/accounts-payable/${account.id}`);

            if (!response) {
               throw new Error(`Error fetching account details: ${response}`);
            }

           
            const data = await response.data;

            setValue('supplierId', data.supplier.id || '');
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

         } finally {
            setLoading(false);
         }
      };

      fetchAccountDetails();
   }, [account, setValue]);

   const onSubmit = async (data: EditAccountPayableFormData) => {
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
            supplierId: data.supplierId,
            documentNumber: data.documentNumber,
            documentDate: data.documentDate ? data.documentDate.toISOString() : null,
            dueDate: data.dueDate ? data.dueDate.toISOString() : null,
            value: Number(unmaskedValue),
            discount: Number(unmaskedDiscount),
            fine: Number(unmaskedFine),
            interest: Number(unmaskedInterest),
            costCenterId: data.costCenterId,
            plannedPaymentMethod: data.plannedPaymentMethod,
            observation: data.observation || ""
         };

         await api.put(`/accounts-payable/${account.id}`, formattedData);

         toast.success('Conta atualizada com sucesso!');
         getAccounts();
         closeModal();
      } catch (error: any) {
         console.error('Erro ao atualizar conta:', error);
         const errorMessage = error.response?.data?.message || 'Erro ao atualizar conta a pagar';
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