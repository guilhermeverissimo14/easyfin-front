'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { toast } from "react-toastify";
import axios from 'axios';

import { useModal } from '../modal-views/use-modal';
import { api } from '@/service/api';
import { AddressType, CustomErrorLogin, CustomerType } from '@/types';
import { InputField } from '@/components/input/input-field';
import { cpfCnpjMask, phoneNumberMask } from '@/utils/format';
import { SelectField } from '@/components/input/select-field';
import { LoadingSpinner } from '@/components/loading-spinner';


const customerSchema = z.object({
   name: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .nonempty('Nome não pode ser vazio'),
   cnpj: z
      .string()
      .nonempty('CNPJ não pode ser vazio'),
   email: z
      .string()
      .email('Formato de e-mail inválido')
      .nullable()
      .optional(),
   retIss: z
      .string()
      .nonempty('Retenção de ISS não pode ser vazio'),
   phone: z
      .string()
      .nullable()
      .optional(),
   address: z
      .string()
      .nullable()
      .optional(),
   zipCode: z
      .string()
      .nullable()
      .optional(),
   city: z
      .string()
      .nullable()
      .optional(),
   state: z
      .string()
      .nullable()
      .optional(),
   country: z
      .string()
      .nullable()
      .optional(),
   contact: z
      .string()
      .nullable()
      .optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface EditCustomerProps {
   id: string;
   getCustomers?: () => void;
}

export const EditCustomer = ({ getCustomers, id }: EditCustomerProps) => {
   const [loading, setLoading] = useState(false);
   const [customerDetails, setCustomerDetails] = useState<CustomerType | null>(null);
   const [loadingCustomer, setLoadingCustomer] = useState(false);

   const { closeModal } = useModal();

   const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      control,
      watch,
   } = useForm<CustomerFormData>({
      resolver: zodResolver(customerSchema),
   });

   const fetchAddressFromCEP = async (cep: string) => {
      if (!cep || cep.length < 8) return;

      const cleanCep = cep.replace(/\D/g, '');

      if (cleanCep.length !== 8) return;

      try {
         setLoading(true);
         const response = await axios<AddressType>(`https://viacep.com.br/ws/${cleanCep}/json/`);

         if (!response.data?.erro) {
            setValue('address', response.data.logradouro);
            setValue('city', response.data.localidade);
            setValue('state', response.data.uf);
         } else {
            toast.error('CEP não encontrado');
         }
      } catch (error) {
         toast.error('Erro ao buscar o CEP');
         console.error('Erro ao buscar o CEP:', error);
      } finally {
         setLoading(false);
      }
   };

   const onSubmit = async (data: CustomerFormData) => {
      setLoading(true);

      const requestData = { ...data };

      if (!requestData.phone) delete requestData.phone;
      if (!requestData.email) delete requestData.email;
      if (!requestData.address) delete requestData.address;
      if (!requestData.zipCode) delete requestData.zipCode;
      if (!requestData.city) delete requestData.city;
      if (!requestData.state) delete requestData.state;
      if (!requestData.country) delete requestData.country;
      if (!requestData.contact) delete requestData.contact;

      if (requestData.phone) requestData.phone = requestData.phone.replace(/\D/g, '');
      if (requestData.cnpj) requestData.cnpj = requestData.cnpj.replace(/\D/g, '');
      if (requestData.zipCode) requestData.zipCode = requestData.zipCode.replace(/\D/g, '');


      try {
         await api.put(`/customers/${id}`, requestData);

         toast.success('Cliente atualizado com sucesso!');
         getCustomers?.();
         closeModal();
      } catch (error) {
         const err = error as CustomErrorLogin;
         toast.error(err.response?.data?.message || 'Erro ao atualizar cliente');
         console.log('Erro ao atualizar cliente', err);
      } finally {
         setLoading(false);
      }
   };

   const getCustomerDetails = async () => {
      setLoadingCustomer(true);
      try {
         const response = await api.get<CustomerType>(`/customers/${id}`);

         setCustomerDetails(response.data);
         setValue('name', response.data.name);
         setValue('cnpj', cpfCnpjMask(response.data.cnpj));
         setValue('email', response.data.email || '');
         setValue('phone', response.data.phone ? phoneNumberMask(response.data.phone) : '');
         setValue('address', response.data.address || '');
         setValue('zipCode', response.data.zipCode || '');
         setValue('city', response.data.city || '');
         setValue('state', response.data.state || '');
         setValue('country', response.data.country || 'Brasil');
         setValue('contact', response.data.contact || '');
         setValue('retIss', response.data.retIss ? "true" : "false");
      } catch (error) {
         console.error('Erro ao buscar cliente:', error);
         toast.error('Erro ao buscar dados do cliente');
      } finally {
         setLoadingCustomer(false);
      }
   };

   useEffect(() => {
      getCustomerDetails();
   }, [id]);

   const retIssOptions = [
      {
         label: 'Sim',
         value: "true",
      },
      {
         label: 'Não',
         value: "false",
      }
   ];

   if (loadingCustomer) {
      return (
         <div className="flex h-full w-full items-center justify-center p-10">
            <LoadingSpinner />
         </div>
      );
   }

   return (
      <div className="mx-auto rounded-lg shadow-md">
         <div className="w-full space-y-5">
            <InputField
               label="Nome da Empresa"
               placeholder="Digite o nome da empresa"
               type="text"
               register={register('name')}
               error={errors.name?.message}
            />

            <Controller
               control={control}
               name="retIss"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Retenção de ISS"
                     placeholder="Retenção de ISS"
                     options={retIssOptions}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.retIss?.message}
                  />
               )}
            />

            <InputField
               label="CNPJ"
               placeholder="Digite o CNPJ"
               type="text"
               register={register('cnpj')}
               error={errors.cnpj?.message}
               onChange={(e) => {
                  const value = e.target.value;
                  setValue('cnpj', cpfCnpjMask(value));
               }}
            />

            <InputField
               label="Email (opcional)"
               placeholder="Digite o email"
               type="email"
               register={register('email')}
               error={errors.email?.message}
            />

            <InputField
               label="Telefone (opcional)"
               placeholder="Digite o telefone"
               type="text"
               register={register('phone')}
               error={errors.phone?.message}
               onChange={(e) => {
                  const value = e.target.value;
                  setValue('phone', phoneNumberMask(value));
               }}
            />

            <InputField
               label="CEP (opcional)"
               placeholder="Digite o CEP"
               type="text"
               register={register('zipCode')}
               error={errors.zipCode?.message}
               onChange={(e) => {
                  const value = e.target.value;
                  const cepFormatted = value
                     .replace(/\D/g, '')
                     .replace(/(\d{5})(\d)/, '$1-$2')
                     .substr(0, 9);
                  setValue('zipCode', cepFormatted);

                  if (cepFormatted.length === 9) {
                     fetchAddressFromCEP(cepFormatted);
                  }
               }}
            />

            <div className="grid grid-cols-2 gap-4">
               <InputField
                  label="Endereço (opcional)"
                  placeholder="Digite o endereço"
                  type="text"
                  register={register('address')}
                  error={errors.address?.message}
               />
               <InputField
                  label="Cidade (opcional)"
                  placeholder="Digite a cidade"
                  type="text"
                  register={register('city')}
                  error={errors.city?.message}
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <InputField
                  label="Estado (opcional)"
                  placeholder="Digite o estado"
                  type="text"
                  register={register('state')}
                  error={errors.state?.message}
               />
               <InputField
                  label="País (opcional)"
                  placeholder="Digite o país"
                  type="text"
                  register={register('country')}
                  error={errors.country?.message}
               />
            </div>

            <InputField
               label="Contato (opcional)"
               placeholder="Digite o nome do contato"
               type="text"
               register={register('contact')}
               error={errors.contact?.message}
            />

            <Button
               onClick={handleSubmit(onSubmit)}
               disabled={loading}
               className="w-full"
               type="submit"
               size="lg"
            >
               <span>{loading ? 'Carregando...' : 'Salvar'}</span>
            </Button>
         </div>
      </div>
   );
};