'use client';
import { useEffect, useState } from 'react';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { z } from 'zod';
import { Button, Checkbox } from 'rizzui';
import { toast } from "react-toastify";
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { InputField } from '@/components/input/input-field';
import { moneyMask } from '@/utils/format';
import { SelectField } from '@/components/input/select-field';

interface SettingsData {
   commissionPerHectare: string;
   localManagerCommission: string;
   generalManagerCommission: string;
   defaultPaymentMethod: string;
   updatedAt?: string;
}

const settingsSchema = z.object({
   commissionPerHectare: z.string().min(1).optional(),
   localManagerCommission: z.string().min(1).max(3).optional(),
   generalManagerCommission: z.string().min(1).max(3).optional(),
   defaultPaymentMethod: z.string().min(1).optional(),
});

const SettingsDetails = () => {
   const [settings, setSettings] = useState<SettingsData | null>(null);
   const [loading, setLoading] = useState(true);
   const [checkbox, setCheckbox] = useState(0);

   const {
      register,
      handleSubmit,
      reset,
      setValue,
      control,
      formState: { errors },
   } = useForm<SettingsData>({
      resolver: zodResolver(settingsSchema),
   });

   const fetchSettings = async () => {
      try {
         const result = await apiCall(() => api.get('/settings'));

         if (!result) {
            return;
         }

         console.log('result.data.commissionPerHectare', result.data.commissionPerHectare);

         const formattedData = {
            commissionPerHectare: moneyMask((result.data.commissionPerHectare * 100).toString()),
            localManagerCommission: (result.data.localManagerCommission * 100).toString(),
            generalManagerCommission: (result.data.generalManagerCommission * 100).toString(),
            defaultPaymentMethod: result.data.defaultPaymentMethod,
         };

         setSettings(formattedData);
         reset(formattedData);
      } catch (error) {
         console.error('Erro ao buscar as configurações:', error);
      } finally {
         setLoading(false);
      }
   };

   const paymentOptions = [
      { label: 'Boleto', value: 'BOLETO' },
      { label: 'PIX', value: 'PIX' },
      { label: 'Cartão de Crédito', value: 'CARTAO_CREDITO' },
      { label: 'Cartão de Débito', value: 'CARTAO_DEBITO' },
   ];

   async function onSubmit(data: SettingsData) {
      try {
         setLoading(true);
         const formattedData = {
            commissionPerHectare: parseFloat(
               data.commissionPerHectare
                  ?.toString()
                  .replace(/[^\d,]/g, '')
                  .replace(',', '.') as string
            ),
            localManagerCommission: parseFloat(data.localManagerCommission) / 100,
            generalManagerCommission: parseFloat(data.generalManagerCommission) / 100,
            defaultPaymentMethod: data.defaultPaymentMethod.toUpperCase(),
         };

         console.log('formattedData', formattedData);

         await apiCall(() => api.put('/settings', formattedData));
         fetchSettings();

         toast.success('Configurações atualizadas com sucesso!');
      } catch (error) {
         toast.error('Erro ao atualizar as configurações. Verifique os campos e tente novamente.');
      } finally {
         setLoading(false);
      }
   }

   useEffect(() => {
      fetchSettings();
   }, []);

   return (
      <div className="py-4">
         {loading ? (
            <div>Carregando configurações...</div>
         ) : (
            settings && (
               <form className="flex w-full flex-col items-center justify-center" onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                     <InputField
                        label="Comissão por Hectare (Padrão)"
                        type="text"
                        placeholder="Digite o valor por hectare"
                        register={register('commissionPerHectare')}
                        error={errors.commissionPerHectare?.message}
                        onChange={(e) => {
                           const value = e.target.value;
                           setValue('commissionPerHectare', moneyMask(value));
                        }}
                     />

                     <InputField
                        label="Comissão do Gerente Geral (%)"
                        type="text"
                        placeholder="Digite o valor por hectare"
                        maxLength={3}
                        register={register('generalManagerCommission')}
                        onChange={(e) => {
                           const value = e.target.value;
                           setValue('generalManagerCommission', value);
                        }}
                     />

                     <InputField
                        label="Comissão do Gerente Local (%)"
                        type="text"
                        placeholder="Digite o valor por hectare"
                        register={register('localManagerCommission')}
                        maxLength={3}
                        onChange={(e) => {
                           const value = e.target.value;
                           setValue('localManagerCommission', value);
                        }}
                     />

                     <Controller
                        control={control}
                        name="defaultPaymentMethod"
                        render={({ field: { value, onChange } }) => (
                           <SelectField
                              label="Método de Pagamento (Padrão)"
                              placeholder="Selecione o método de pagamento"
                              options={paymentOptions}
                              onChange={(selected) => {
                                 onChange(selected);
                              }}
                              value={value || ''}
                           />
                        )}
                     />
                  </div>

                  <div className="mt-4 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                     <Checkbox
                        value={checkbox}
                        defaultChecked={false}
                        onChange={(e) => setCheckbox(e.target.checked ? 1 : 0)}
                        label="Financeiro pode lançar folha de pagamento"
                     />
                  </div>

                  <Button type="submit" className="mt-4 w-full md:absolute md:bottom-16 md:right-8 md:w-32" disabled={loading}>
                     <span>{loading ? 'Salvando...' : 'Salvar'}</span>
                  </Button>
               </form>
            )
         )}

         {settings?.updatedAt && (
            <div className="absolute bottom-4 right-4 text-xs text-gray-400">
               <strong>Atualizado pela última vez em:</strong> {new Date(settings.updatedAt).toLocaleString()}
            </div>
         )}
      </div>
   );
};

export default SettingsDetails;
