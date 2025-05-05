'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from "react-toastify";
import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { CustomErrorLogin, userType } from '@/types';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { apiCall } from '@/helpers/apiHelper';
import { cpfCnpjMask, moneyMask, phoneNumberMask } from '@/utils/format';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';
import { format } from 'date-fns';

const userSchema = z.object({
   name: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .nonempty('Nome não pode ser vazio'),
   email: z
      .string()
      .email('Formato de e-mail inválido')
      .nonempty('Email não pode ser vazio'),
   role: z.string().nonempty('Tipo de usuário não pode ser vazio'),
   commission: z.string().optional(),
   birthdate: z.date().optional().nullable(),
   phone: z
      .string()
      .optional(),
   cpfCnpj: z.string().optional(),
   localManagerId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface OptionsSelect {
   label: string;
   value: string;
}

interface FormUserProps {
   roleOptions: OptionsSelect[];
   getUsers?: () => void;
}

export const FormUser = ({ roleOptions, getUsers }: FormUserProps) => {
   const [loading, setLoading] = useState(false);
   const [isLocalManager, setIsLocalManager] = useState(false);
   const [isLocalManagerPilot, setIsLocalManagerPilot] = useState(false);
   const [localManagerOptions, setLocalManagerOptions] = useState<
      OptionsSelect[]
   >([]);

   const { closeModal } = useModal();

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
      control,
   } = useForm<UserFormData>({
      resolver: zodResolver(userSchema),
      defaultValues: {
         role: '',
         localManagerId: '',
      },
   });

   const eighteenYearsAgo = new Date();
   eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

   const formatDate = (date: Date) => {
      return format(date, 'yyyy-MM-dd');
   };

   const onSubmit = async (data: UserFormData) => {
      setLoading(true);

      const requestData = { ...data };

      if (!isLocalManager) {
         delete requestData.localManagerId;
      }

      if (!requestData.phone) {
         delete requestData.phone;
      }
      if (!requestData.cpfCnpj) {
         delete requestData.cpfCnpj;
      }
      if (!requestData.birthdate) {
         delete requestData.birthdate;
      }

      requestData.phone = requestData.phone?.replace(/\D/g, '');
      requestData.cpfCnpj = requestData.cpfCnpj?.replace(/\D/g, '');
      requestData.commission = requestData.commission ? parseFloat(requestData.commission.replace(/[^\d,]/g, '').replace(',', '.')) : 0 as any;

      if (!requestData.commission || requestData.commission === 0 as any) {
         delete requestData.commission;
      }

      if (requestData.birthdate) {
         requestData.birthdate = formatDate(requestData.birthdate) as any;
      }

      try {
         await api.post('/users', requestData);

         toast.success('Usuário cadastrado com sucesso!');
         getUsers?.();
         closeModal();
      } catch (error) {
         const err = error as CustomErrorLogin;

         toast.error(err.response.data.message || 'Erro ao cadastrar usuário');
         console.log('Erro ao cadastrar usuário', err);
      } finally {
         setLoading(false);
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

   useEffect(() => {
      const userRole = (JSON.parse(localStorage.getItem('eas:user') as string) as userType).role;
      if (userRole !== 'LOCAL_MANAGER') {
         setIsLocalManager(true);
      } else {
         setIsLocalManager(false);
      }

      if (isLocalManager) getLocalManager();

   }, [isLocalManager]);

   return (
      <form
         className="flex w-[100%] flex-col items-center justify-center"
         onSubmit={handleSubmit(onSubmit)}
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
               label="CPF/CNPJ (opcional)"
               placeholder="Digite o CPF/CNPJ"
               type="text"
               register={register('cpfCnpj')}
               error={errors.cpfCnpj?.message}
               onChange={(e) => {
                  const value = e.target.value;
                  setValue('cpfCnpj', cpfCnpjMask(value));
               }}
            />

            <Controller
               control={control}
               name="birthdate"
               render={({ field: { onChange, value } }) => (
                  <DatePicker
                     label='Data de nascimento (opcional)'
                     selected={value}
                     onChange={onChange}
                     dateFormat="dd/MM/yyyy"
                     showMonthYearDropdown
                     minDate={new Date('1930-02-01')}
                     maxDate={eighteenYearsAgo}
                     scrollableMonthYearDropdown
                     placeholderText="Sua data de nascimento"
                     popperPlacement="bottom-end"
                     inputProps={{
                        variant: 'outline',
                        inputClassName:
                           'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
                     }}
                     className="flex-grow [&>label>span]:font-medium"
                     locale={ptBR}
                  />
               )}
            />

            <Controller
               control={control}
               name="role"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Tipo de usuário"
                     placeholder="Selecione o tipo de usuário"
                     options={roleOptions}
                     onChange={(selected) => {
                        onChange(selected);
                        setIsLocalManagerPilot(selected === 'pilot');
                     }}
                     value={value || ''}
                     error={errors.role?.message}
                  />
               )}
            />

            {isLocalManagerPilot && isLocalManager && (
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

            {isLocalManagerPilot && isLocalManager && (
               <Controller
                  control={control}
                  name="localManagerId"
                  render={({ field: { value, onChange } }) => (
                     <SelectField
                        label="Gerente local"
                        placeholder="Selecione o gerente local"
                        options={localManagerOptions}
                        onChange={(selected) => onChange(selected)}
                        value={value || ''}
                        error={errors.localManagerId?.message}
                     />
                  )}
               />
            )}

            <Button
               disabled={loading}
               className="w-full"
               type="submit"
               size="lg"
            >
               <span>{loading ? 'Carregando...' : 'Cadastrar'}</span>
            </Button>
         </div>
      </form>
   );
};
