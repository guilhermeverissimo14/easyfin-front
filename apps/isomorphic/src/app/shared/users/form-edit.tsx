'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { toast } from "react-toastify";
import { PiPlusBold } from 'react-icons/pi';

import { useModal } from '../modal-views/use-modal';
import { api } from '@/service/api';
import { CustomErrorLogin, OptionsSelect, userType } from '@/types';
import { InputField } from '@/components/input/input-field';
import { cpfCnpjMask, formatMoney, moneyMask, phoneNumberMask } from '@/utils/format';
import { SelectField } from '@/components/input/select-field';
import { apiCall } from '@/helpers/apiHelper';

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

const assistantSchema = z.object({
   name: z.string().nonempty("Nome não pode ser vazio"),
   baseSalary: z.string().nonempty("Salário base não pode ser vazio"),
   commission: z.string().nonempty("Comissão não pode ser vazio"),
})


type UserFormData = z.infer<typeof userSchema>;
type AssistantFormData = z.infer<typeof assistantSchema>;

interface FormUserProps {
   id: string;
   getUsers?: () => void;
}

export const FormEdit = ({ getUsers, id }: FormUserProps) => {

   const [localManagerOptions, setLocalManagerOptions] = useState<OptionsSelect[]>([]);
   const [loading, setLoading] = useState(false);
   const [userDetails, setUserDetails] = useState<userType | null>(null);
   const [loadingUser, setLoadingUser] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [openModalAssistant, setOpenModalAssistant] = useState(false);
   const [activeTab, setActiveTab] = useState('userData');
   const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);

   const userRole = (JSON.parse(localStorage.getItem('eas:user') as string) as userType).role;

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

   const {
      register: registerAssistant,
      handleSubmit: handleSubmitAssistant,
      formState: { errors: errorsAssistant },
      setValue: setValueAssistant,
      reset,
   } = useForm<AssistantFormData>({
      resolver: zodResolver(assistantSchema),
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

   const onSubmitAssistant = async (data: AssistantFormData) => {
      setLoading(true);

      const requestData = { ...data };

      requestData.baseSalary = requestData.baseSalary ? parseFloat(requestData.baseSalary.replace(/[^\d,]/g, '').replace(',', '.')) : 0 as any;
      requestData.commission = requestData.commission ? parseFloat(requestData.commission.replace(/[^\d,]/g, '').replace(',', '.')) : 0 as any;

      try {
         const response = await api.post(`/pilot-assistants`, requestData);

         if (response.status === 201) {
            await api.post(`/pilot-assistants/pilot/${id}/assistant/${response.data.id}`, requestData);
         }

         getUserDetails();
         setOpenModalAssistant(false);
         toast.success('Assistente adicionado com sucesso!');
         reset();
      } catch (error) {
         const err = error as CustomErrorLogin;

         console.log('Erro ao adicionar assistente', err);
         toast.error('Erro ao adicionar assistente');
      } finally {
         setLoading(false);
      }
   };

   const updateAssistant = async (data: AssistantFormData) => {
      setLoading(true);

      const requestData = {
         ...data,
         baseSalary: parseFloat(data.baseSalary.replace(/[^\d,]/g, '').replace(',', '.')),
         commission: parseFloat(data.commission.replace(/[^\d,]/g, '').replace(',', '.')),
      };

      try {
         await api.put(`/pilot-assistants/${selectedAssistantId}`, requestData);

         toast.success('Assistente atualizado com sucesso!');
         getUserDetails();
         setOpenModalAssistant(false);
         reset();
      } catch (error) {
         console.error('Erro ao atualizar assistente:', error);
         toast.error('Erro ao atualizar assistente.');
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
         setLoadingUser(false);
      }
   };

   const fetchAssistantDetails = async (assistantId: string) => {
      try {
         const response = await api.get(`/pilot-assistants/${assistantId}`);
         const assistant = response.data;

         setValueAssistant('name', assistant.name);
         setValueAssistant('baseSalary', formatMoney(assistant.baseSalary));
         setValueAssistant('commission', formatMoney(assistant.commission));

         setSelectedAssistantId(assistantId);
         setOpenModalAssistant(true);
      } catch (error) {
         console.error('Erro ao buscar detalhes do assistente:', error);
         toast.error('Erro ao buscar detalhes do assistente.');
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

   const handleDeleteAssistant = async (assistantId: string) => {
      try {
         await api.delete(`/pilot-assistants/pilot/${id}/assistant/${assistantId}`);
         toast.success('Assistente excluído com sucesso!');
         getUserDetails();
      } catch (error) {
         console.error('Erro ao excluir assistente:', error);
         toast.error('Erro ao excluir assistente.');
      }
   };

   const getLocalManager = async () => {
      try {
         const response = await apiCall(() => api.get<userType[]>('/users'));

         if (!response) {
            return;
         }

         const localManagerFiltered = response.data
            .filter((user) => user.role === 'LOCAL_MANAGER')
            .map((localManager) => ({
               label: localManager.name,
               value: localManager.id,
            }));

         setLocalManagerOptions(localManagerFiltered);
      } catch (error) {
         console.error('Erro ao buscar usuários:', error);
      }
   };

   useEffect(()=>{
      getLocalManager();
   }, [])

   useEffect(() => {
      getUserDetails();
   }, [id]);

   if (loadingUser) {
      return (
         <div className="flex w-full flex-col items-center justify-center">
            <span>Carregando...</span>
         </div>
      );
   }

   if (openModalAssistant) {
      return (
         <>
            <div className="grid grid-cols-1 gap-4">
               <InputField
                  label="Nome do assistente"
                  placeholder="Digite o nome do assistente"
                  type="text"
                  register={registerAssistant('name')}
                  error={errorsAssistant.name?.message}
               />
               <InputField
                  label="Salário base"
                  placeholder="Digite o salário base"
                  type="text"
                  register={registerAssistant('baseSalary')}
                  error={errorsAssistant.baseSalary?.message}
                  onChange={(e) => {
                     const value = e.target.value;
                     setValueAssistant('baseSalary', moneyMask(value));
                  }}
               />
               <InputField
                  label="Comissão"
                  placeholder="Digite a comissão"
                  type="text"
                  register={registerAssistant('commission')}
                  error={errorsAssistant.commission?.message}
                  onChange={(e) => {
                     const value = e.target.value;
                     setValueAssistant('commission', moneyMask(value));
                  }}
               />

               <div className="flex flex-col md:flex-row justify-between items-center w-full">
                  <Button
                     className="w-full md:w-[45%] mt-4"
                     type="button"
                     variant="outline"
                     size="lg"
                     onClick={() => {
                        setOpenModalAssistant(false);
                        setSelectedAssistantId(null);
                        reset();
                     }}
                  >
                     Cancelar
                  </Button>

                  <Button
                     onClick={handleSubmitAssistant(selectedAssistantId ? updateAssistant : onSubmitAssistant)} // Chama a função correta
                     className="w-full md:w-[45%] mt-4"
                     type="submit"
                     size="lg"
                  >
                     <span>{loading ? 'Carregando...' : selectedAssistantId ? 'Atualizar' : 'Salvar'}</span>
                  </Button>
               </div>
            </div>
         </>
      );
   }

   return (
      <div
         className="mx-auto rounded-lg shadow-md"
      >

         {userDetails?.role === 'PILOT' && (

            <div className="mb-4 flex">
               <button
                  type="button"
                  className={`py-1 text-gray-700 hover:text-black focus:outline-none ${activeTab === 'userData' ? 'border-b-2 border-green-500 font-semibold' : ''
                     }`}
                  onClick={() => setActiveTab('userData')}
                  style={{ display: 'block', textAlign: 'left' }}
               >
                  Dados do usuário
               </button>
               <button
                  type="button"
                  className={`ml-8 py-1 text-gray-700 hover:text-black focus:outline-none ${activeTab === 'assistant' ? 'border-b-2 border-green-500 font-semibold' : ''
                     }`}
                  onClick={() => setActiveTab('assistant')}
                  style={{ display: 'block', textAlign: 'left' }}
               >
                  Assistente
               </button>
            </div>
         )}


         {activeTab == "userData" && (
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

               {userDetails?.role === 'PILOT' && userRole !== "LOCAL_MANAGER" && (
                  <Controller
                     control={control}
                     name="localManagerId"
                     render={({ field: { value, onChange } }) => (
                        <SelectField
                           label="Gerente local"
                           placeholder="Selecione o gerente local"
                           options={localManagerOptions}
                           onChange={(selected) => {
                              onChange(selected);
                           }}
                           value={value || ''}
                        />
                     )}
                  />
               )}

               {userDetails?.role === 'PILOT' && (
                  <InputField
                     label="Comissão po hectares (opcional)"
                     placeholder="Digite um valor"
                     type="text"
                     register={register('commission')}
                     error={errors.commission?.message}
                     onChange={(e) => {
                        const value = e.target.value;
                        setValue('commission', moneyMask(value));
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
         )}

         {activeTab == "assistant" && (
            <div className="flex flex-row flex-wrap space-x-4">

               <div
                  className=" mt-2 flex h-48 w-64 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4 text-gray-500"
                  onClick={() => setOpenModalAssistant(true)}
               >
                  <PiPlusBold className="me-1.5 h-[24px] w-[24px]" />
                  <span className="text-lg">Adicionar assistente</span>
               </div>

               {userDetails?.assistants?.map((assistant) => (
                  <div
                     key={assistant.id}
                     className="flex mt-2 h-48 w-64 flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 text-gray-800 shadow-lg transition-shadow duration-300 hover:shadow-xl"
                  >

                     <h5 className='font-semibold'>{assistant.name}</h5>
                     <p className='text-sm'>Salário base: {formatMoney(assistant.baseSalary)}</p>
                     <p className='text-sm'>Comissão: {formatMoney(assistant.commission)}</p>

                     <div className="mt-4 flex flex-row justify-start space-x-2">
                        <button
                           className="text-gray-800 transition duration-200 hover:text-gray-500 hover:underline"
                           onClick={() => fetchAssistantDetails(assistant.id)}
                        >
                           Alterar
                        </button>
                        <span>|</span>
                        <button
                           className="text-red-800 transition duration-200 hover:text-red-600 hover:underline"
                           onClick={() => handleDeleteAssistant(assistant.id)}
                        >
                           Excluir
                        </button>
                     </div>
                  </div>
               ))}

            </div>
         )}


      </div>
   );
};
