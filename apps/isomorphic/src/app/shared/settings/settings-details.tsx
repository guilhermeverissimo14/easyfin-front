'use client';
import { useEffect, useState } from 'react';
import { api } from '@/service/api';
import { z } from 'zod';
import { Button } from 'rizzui';
import { toast } from "react-toastify";
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { SelectField } from '@/components/input/select-field';
import { LoadingSpinner } from '@/components/loading-spinner';
import { apiCall } from '@/helpers/apiHelper';

interface SettingsData {
   cashFlowDefault: string;
   bankAccountDefault: string;
   updatedAt?: string;
}

const settingsSchema = z.object({
   cashFlowDefault: z.string().min(1, 'Modo padrão de fluxo de caixa é obrigatório'),
   bankAccountDefault: z.string().optional(),
});

const SettingsDetails = () => {
   const [settings, setSettings] = useState<SettingsData | null>(null);
   const [loading, setLoading] = useState(true);
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
      }
   });

   const cashFlowDefault = watch('cashFlowDefault');

   const fetchBankAccounts = async () => {
      try {
         const response = await apiCall(()=> api.get('/bank-accounts'));

          if (!response?.data) {
            return
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

   const fetchSettings = async () => {
      try {
         setLoading(true);
         const response = await api.get('/settings');
  
         const data = response.data;
         const formattedData = {
            cashFlowDefault: data.cashFlowDefault || 'BANK',
            bankAccountDefault: data.bankAccountDefault || '',
            updatedAt: data.updatedAt
         };

         setSettings(formattedData);
         reset(formattedData);
      } catch (error) {
         // console.error('Erro ao buscar as configurações:', error);
         toast.error('Erro ao carregar configurações do sistema');
      } finally {
         setLoading(false);
      }
   };

   const cashFlowOptions = [
      { label: 'Dinheiro', value: 'CASH' },
      { label: 'Banco', value: 'BANK' },
   ];

   async function onSubmit(data: SettingsData) {
      try {
         setLoading(true);
         const formattedData = {
            cashFlowDefault: data.cashFlowDefault,
            bankAccountDefault: data.bankAccountDefault || ''
         };

         await api.put('/settings', formattedData);
         await fetchSettings();

         toast.success('Configurações atualizadas com sucesso!');
      } catch (error) {
         console.error('Erro ao atualizar configurações:', error);
         toast.error('Erro ao atualizar as configurações. Verifique os campos e tente novamente.');
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      Promise.all([
         fetchSettings(),
         fetchBankAccounts()
      ]);
   }, []);

   return (
      <div className="py-4">
         {loading ? (
            <div className="flex h-40 items-center justify-center">
               <LoadingSpinner />
            </div>
         ) : (
            settings && (
               <form className="flex w-full flex-col items-center justify-center" onSubmit={handleSubmit(onSubmit)}>
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

                  <div className="mt-8 flex w-full justify-end">
                     <Button type="submit" className="w-full md:w-32" disabled={loading}>
                        <span>{loading ? 'Salvando...' : 'Salvar'}</span>
                     </Button>
                  </div>
               </form>
            )
         )}

         {settings?.updatedAt && (
            <div className="mt-10 text-right text-xs text-gray-400">
               <strong>Atualizado pela última vez em:</strong> {new Date(settings.updatedAt).toLocaleString()}
            </div>
         )}
      </div>
   );
};

export default SettingsDetails;