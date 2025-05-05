'use client';

import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { userType } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from "react-toastify";
import { z } from 'zod';
import { Form } from '@core/ui/form';
import { Input } from 'rizzui';
import FormGroup from '@/app/shared/form-group';
import FormFooter from '@core/components/form-footer';
import { DatePicker } from '@core/ui/datepicker';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import { cpfCnpjMask, phoneNumberMask } from '@/utils/format';
import { useRouter } from 'next/navigation';

registerLocale('pt-BR', ptBR);
setDefaultLocale('pt-BR');

const userSchema = z.object({
   name: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .nonempty('Nome não pode ser vazio'),
   birthdate: z.date().optional().nullable(),
   phone: z
      .string()
      .max(11, 'Telefone deve ter no máximo 11 caracteres')
      .optional(),
   cpfCnpj: z
      .string()
      .max(14, 'CNPJ deve ter no máximo 14 caracteres')
      .min(11, 'CPF precisa ter pelo menos 11 caracteres')
      .optional()
      .nullable(),
});

export type PersonalInfoFormTypes = z.infer<typeof userSchema>;

export default function ProfileDetails() {

   const router = useRouter();

   const user = JSON.parse(localStorage.getItem('eas:user') || '{}') as userType;
   const [loading, setLoading] = useState(false);

   const defaultValues = {
      name: user.name,
      birthdate: user.birthdate ? new Date(user.birthdate) : null,
      phone: user.phone || undefined,
      cpfCnpj: user.cpfCnpj || undefined,
   };

   const {
      reset,
      formState: { errors },
   } = useForm<PersonalInfoFormTypes>({
      resolver: zodResolver(userSchema),
      defaultValues,
   });

   const eighteenYearsAgo = new Date();
   eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

   const onSubmit: SubmitHandler<PersonalInfoFormTypes> = async (data) => {
      setLoading(true);
      const updateData = {
         ...data,
         birthdate: data.birthdate ? data.birthdate.toISOString() : null,
         profileCompleted: false,
      };

      if (
         updateData.name &&
         updateData.birthdate &&
         updateData.phone &&
         updateData.cpfCnpj &&
         user.avatar
      ) {
         updateData.profileCompleted = true;
      }

      const result = await apiCall(() =>
         api.put(`/users/${user.id}`, updateData)
      );

      setLoading(false);

      if (!result) {
         return;
      }

      const updatedUser = {
         ...user,
         cpfCnpj: result.data.cpfCnpj,
         birthdate: result.data.birthdate,
         phone: result.data.phone,
         name: result.data.name,
      };
      localStorage.setItem('eas:user', JSON.stringify(updatedUser));

      reset({
         name: updatedUser.name,
         birthdate: updatedUser.birthdate
            ? new Date(updatedUser.birthdate)
            : null,
         phone: phoneNumberMask(updatedUser.phone || '') || undefined,
         cpfCnpj: cpfCnpjMask(updatedUser.cpfCnpj || '') || undefined,
      });

      toast.success("Perfil atualizado com sucesso!");
      redirectDashboard();
   };

   function redirectDashboard() {

      const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;
      
      if (userRole === 'FINANCIAL') {
         router.push('/user-financial');
      } else if (userRole === 'ADMIN' || userRole === 'MANAGER') {
         router.push('/dashboard-admin');
      } else if (userRole === 'PILOT') {
         router.push('/dashboard-pilot');
      } else if (userRole === 'LOCAL_MANAGER') {
         router.push('/dashboard-local-manager');
      }

   }

   return (
      <div className="mx-auto w-full max-w-[1294px]">
         <div className="-mx-4 flex items-center justify-around border-b-2 border-b-gray-200 font-medium sm:mx-0 md:justify-start md:gap-8"></div>
         <Form<PersonalInfoFormTypes>
            resetValues={reset}
            onSubmit={onSubmit}
            className="@container"
            useFormProps={{
               mode: 'onChange',
               defaultValues,
            }}
         >
            {({
               register,
               control,
               setValue,
               getValues,
               formState: { errors },
            }) => {
               return (
                  <>
                     <FormGroup
                        title="Informações pessoais"
                        description="Atualize suas informações pessoais"
                        className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                     />

                     <div className="mb-10 grid gap-4 divide-y divide-dashed divide-gray-200 @2xl:gap-4 @3xl:gap-8">
                        <FormGroup
                           title="Nome"
                           className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                           <Input
                              placeholder="Seu nome"
                              {...register('name')}
                              className="flex-grow"
                           />
                        </FormGroup>

                        <FormGroup
                           title="Data de Nascimento"
                           className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                           <Controller
                              control={control}
                              name="birthdate"
                              render={({ field: { onChange, value } }) => (
                                 <DatePicker
                                    selected={value}
                                    onChange={onChange}
                                    dateFormat="dd/MM/yyyy"
                                    showMonthYearDropdown
                                    minDate={new Date('1960-02-01')}
                                    maxDate={eighteenYearsAgo}
                                    scrollableMonthYearDropdown
                                    placeholderText="Sua data de nascimento"
                                    popperPlacement="bottom-end"
                                    inputProps={{
                                       variant: 'outline',
                                       inputClassName:
                                          'px-2 py-1 h-auto [&_input]:text-ellipsis ring-0',
                                    }}
                                    className="flex-grow capitalize"
                                    locale={ptBR}
                                 />
                              )}
                           />
                        </FormGroup>

                        <FormGroup
                           title="Contato"
                           className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                           <Input
                              placeholder="Seu telefone"
                              {...register('phone')}
                              className="flex-grow"
                              maxLength={15}
                              onChange={(e) => {
                                 const value = e.target.value;
                                 setValue('phone', phoneNumberMask(value));
                              }}
                           />
                        </FormGroup>

                        <FormGroup
                           title="CPF/CNPJ"
                           className="pt-7 @2xl:pt-9 @3xl:grid-cols-12 @3xl:pt-11"
                        >
                           <Input
                              placeholder="Seu CPF ou CNPJ"
                              {...register('cpfCnpj')}
                              className="flex-grow"
                              maxLength={18}
                              onChange={(e) => {
                                 const value = e.target.value;
                                 setValue('cpfCnpj', cpfCnpjMask(value));
                              }}
                           />
                        </FormGroup>
                     </div>

                     <FormFooter
                     handleAltBtn={() => redirectDashboard()}
                        isLoading={loading}
                        altBtnText="Cancelar"
                        submitBtnText="Salvar"
                     />

                     <div className="h-10" />
                  </>
               );
            }}
         </Form>
      </div>
   );
}
