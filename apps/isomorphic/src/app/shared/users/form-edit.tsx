'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { toast } from "react-toastify";

import { useModal } from '../modal-views/use-modal';
import { api } from '@/service/api';
import { CustomErrorLogin, userType } from '@/types';
import { InputField } from '@/components/input/input-field';
import { cpfCnpjMask, formatMoney, phoneNumberMask } from '@/utils/format';
import { LoadingSpinner } from '@/components/loading-spinner';

const userSchema = z.object({
   name: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .nonempty('Nome não pode ser vazio'),
   email: z
      .string()
      .email('Formato de e-mail inválido')
      .nonempty('Email não pode ser vazio'),
   phone: z
      .string()
      .max(15, 'Telefone deve ter no máximo 11 caracteres')
      .optional(),
   cpfCnpj:
      z.string()
         .optional(),
   commission:
      z.string()
         .optional(),
   localManagerId: z.string().optional(),
});


type UserFormData = z.infer<typeof userSchema>;

interface FormUserProps {
   id: string;
   getUsers?: () => void;
}

export const FormEdit = ({ getUsers, id }: FormUserProps) => {

   const [loading, setLoading] = useState(false);
   const [userDetails, setUserDetails] = useState<userType | null>(null);
   const [loadingUser, setLoadingUser] = useState(false);
   const [isLoading, setIsLoading] = useState(false);


   const { closeModal } = useModal();

   const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      control,
   } = useForm<UserFormData>({
      resolver: zodResolver(userSchema),
   });

   const onSubmit = async (data: UserFormData) => {
      setLoading(true);

      const requestData = { ...data };

      if (!requestData.phone) {
         delete requestData.phone;
      }
      if (!requestData.cpfCnpj) {
         delete requestData.cpfCnpj;
      }

      requestData.phone = requestData.phone?.replace(/\D/g, '');
      requestData.cpfCnpj = requestData.cpfCnpj?.replace(/\D/g, '');
      requestData.commission = requestData.commission ? parseFloat(requestData.commission.replace(/[^\d,]/g, '').replace(',', '.')) : 0 as any;

      if (!requestData.commission || requestData.commission === 0 as any) {
         delete requestData.commission;
      }

      try {
         await api.put(`/users/${id}`, requestData);

         toast.success('Usuário atualizado com sucesso!');
         getUsers?.();
         closeModal();
      } catch (error) {
         const err = error as CustomErrorLogin;

         console.log('Erro ao atualizar usuário', err);
         toast.error('Erro ao atualizar usuário');
      } finally {
         setLoading(false);
      }
   };

   const getUserDetails = async () => {
      setLoadingUser(true);
      try {
         const response = await api.get<userType>(`/users/${id}`);

         setUserDetails(response.data);
         setValue('name', response.data.name);
         setValue('email', response.data.email);
         setValue('phone', response.data.phone || '');
         setValue('cpfCnpj', response.data.cpfCnpj || '');
         setValue('commission', response.data.commission ? formatMoney(response.data.commission) : '');
         setValue('localManagerId', response.data.localManagerId || '');
      } catch (error) {
         console.error('Erro ao buscar usuários:', error);
      } finally {
         setLoadingUser(true);
      }
   };

   const handleResendEmail = async () => {
      setIsLoading(true);
      try {
         await api.post('/users/send-welcome-email', {
            userId: id,
            name: userDetails?.name,
            email: userDetails?.email,
         });

         toast.success('E-mail de boas-vindas reenviado com sucesso!');
      } catch (error) {
         console.error('Erro ao reenviar e-mail de boas-vindas:', error);
         toast.error('Erro ao reenviar e-mail de boas-vindas.');
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      getUserDetails();
   }, [id]);

   if (loadingUser) {
      return (
         <div className="flex h-full w-full items-center justify-center p-10">
            <LoadingSpinner />
         </div>
      );
   }

   return (
      <div
         className="mx-auto rounded-lg shadow-md"
      >

         <div className="w-full space-y-5">
            <InputField
               label="Nome"
               placeholder="Digite o nome"
               type="text"
               register={register('name')}
               error={errors.name?.message}
            />
            <InputField
               label="Email"
               placeholder="Digite o email"
               type="email"
               register={register('email')}
               error={errors.email?.message}
               disabled={true}
            />

            {userDetails?.phone && (
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
            )}

            {userDetails?.cpfCnpj && (
               <InputField
                  label="CPF/CNPJ (opcional)"
                  placeholder="Digite o CPF ou CNPJ"
                  type="text"
                  register={register('cpfCnpj')}
                  error={errors.cpfCnpj?.message}
                  onChange={(e) => {
                     const value = e.target.value;
                     setValue('cpfCnpj', cpfCnpjMask(value));
                  }}
               />
            )}

            {userDetails?.firstAccess == true && (
               <Button
                  onClick={handleResendEmail}
                  className="mt-2 w-full"
                  size="md"
                  variant="outline"
               >
                  {isLoading ? 'Carregando...' : 'Reenviar e-mail de boas-vindas'}
               </Button>
            )}

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
