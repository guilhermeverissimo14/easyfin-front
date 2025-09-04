'use client';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Button, Checkbox } from 'rizzui';
import { toast } from "react-toastify";
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectField } from '@/components/input/select-field';
import { LoadingSpinner } from '@/components/loading-spinner';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsData {
   cashFlowDefault: string;
   bankAccountDefault: string;
   showClock: boolean;
   updatedAt?: string;
}

const settingsSchema = z.object({
   cashFlowDefault: z.string().min(1, 'Modo padrão de fluxo de caixa é obrigatório'),
   bankAccountDefault: z.string().optional(),
   showClock: z.boolean(),
});

const SettingsDetails = () => {
   const { settings, loading: contextLoading, updateSettings } = useSettings();
   const [loading, setLoading] = useState(false);
   const [bankAccounts, setBankAccounts] = useState([]);

   const {
      handleSubmit,
      reset,
      control,
      watch,
      formState: { errors },
   } = useForm<SettingsData>({
      resolver: zodResolver(settingsSchema),
      defaultValues: {
         cashFlowDefault: 'BANK',
         bankAccountDefault: '',
         showClock: true,
      }
   });

   const cashFlowDefault = watch('cashFlowDefault');

   useEffect(() => {
      if (settings) {
         reset({
            cashFlowDefault: settings.cashFlowDefault,
            bankAccountDefault: settings.bankAccountDefault,
            showClock: settings.showClock,
         });
      }
   }, [settings, reset]);

   const fetchBankAccounts = async () => {
      try {
         const response = await apiCall(() => api.get('/bank-accounts'));

         if (!response?.data) {
            return;
         }
      
         if (response?.data) {
            setBankAccounts(response.data.map((account: { bank: string; agency: string; account: string; id: string }) => ({
               label: `${account.bank} - Agência ${account.agency} - CC ${account.account}`,
               value: account.id
            })));
         }
      } catch (error) {
         console.error('Erro ao buscar contas bancárias:', error);
         toast.error('Não foi possível carregar as contas bancárias');
      }
   };

   useEffect(() => {
      fetchBankAccounts();
   }, []);

   const cashFlowOptions = [
      { label: 'Dinheiro', value: 'CASH' },
      { label: 'Banco', value: 'BANK' },
   ];

   async function onSubmit(data: SettingsData) {
      try {
         setLoading(true);
         const formattedData = {
            cashFlowDefault: data.cashFlowDefault,
            bankAccountDefault: data.bankAccountDefault || '',
            showClock: data.showClock
         };

         await updateSettings(formattedData);
         
         toast.success('Configurações atualizadas com sucesso!');
      } catch (error) {
         console.error('Erro ao atualizar configurações:', error);
         toast.error('Erro ao atualizar as configurações. Verifique os campos e tente novamente.');
      } finally {
         setLoading(false);
      }
   }

   if (contextLoading) {
      return <LoadingSpinner />;
   }

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="@container">
         <div className="mx-auto w-full p-4 py-8 @lg:p-8 @2xl:p-10">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
               <Controller
                  control={control}
                  name="cashFlowDefault"
                  render={({ field: { value, onChange } }) => (
                     <SelectField
                        label="Caixa"
                        placeholder="Selecione o modo padrão"
                        options={cashFlowOptions}
                        onChange={(selected) => {
                           onChange(selected);
                        }}
                        value={value || ''}
                        error={errors.cashFlowDefault?.message}
                     />
                  )}
               />

               {cashFlowDefault === 'BANK' && (
                  <Controller
                     control={control}
                     name="bankAccountDefault"
                     render={({ field: { value, onChange } }) => (
                        <SelectField
                           label="Conta bancária"
                           placeholder="Selecione a conta bancária padrão"
                           options={bankAccounts}
                           onChange={(selected) => {
                              onChange(selected);
                           }}
                           value={value || ''}
                           error={errors.bankAccountDefault?.message}
                        />
                     )}
                  />
               )}
            </div>

            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 mt-8">
               <div className="flex items-center">
                  <Controller
                     control={control}
                     name="showClock"
                     render={({ field: { value, onChange } }) => (
                        <Checkbox
                           label="Exibir relógio"
                           checked={value}
                           onChange={(checked) => onChange(checked)}
                           className="text-sm font-medium"
                        />
                     )}
                  />
               </div>
            </div>

            <div className="mt-8 flex w-full justify-end">
               <Button
                  type="submit"
                  size="lg"
                  className="w-full @md:w-auto"
                  isLoading={loading}
               >
                  Salvar Configurações
               </Button>
            </div>
         </div>
      </form>
   );
};

export default SettingsDetails;