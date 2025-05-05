'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Password } from 'rizzui';
import { toast } from 'react-toastify';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { userType } from '@/types';

interface ChangePasswordForm {
   currentPassword: string;
   newPassword: string;
   confirmNewPassword: string;
}

const ChangePassword = () => {
   const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
   } = useForm<ChangePasswordForm>();

   const user = JSON.parse(localStorage.getItem('eas:user') as string) as userType;
   const [loading, setLoading] = useState(false);

   const resetForm = () => {
      Object.keys(errors).forEach((key) => {
         (errors as any)[key] = '';
      });
      Object.keys(watch()).forEach((key) => {
         (watch as any)[key] = '';
      });
   };

   const onSubmit = async (data: ChangePasswordForm) => {
      if (data.newPassword !== data.confirmNewPassword) {
         toast.error('As novas senhas não conferem.');
         return;
      }

      try {
         setLoading(true);

         await apiCall(() =>
            api
               .patch(`users/${user.id}/update-password`, {
                  password: data.currentPassword,
                  newPassword: data.newPassword,
               })
               .then((response) => {
                  if (response.status === 200) {
                     toast.success('Senha alterada com sucesso!');
                     resetForm();
                  }
               })
         );
      } catch (error) {
         toast.error('Erro ao alterar a senha. Verifique suas credenciais.');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="flex items-center justify-center bg-gray-100 p-40">
         <form className="flex w-full max-w-md flex-col items-center justify-center rounded bg-white p-6 shadow" onSubmit={handleSubmit(onSubmit)}>
            <h2 className="mb-8 text-xl font-semibold">Atualização de Senha</h2>

            <div className="mb-4 w-full">
               <Password
                  label="Senha Atual"
                  placeholder="Digite sua senha atual"
                  {...register('currentPassword', {
                     required: 'Senha atual é obrigatória',
                     validate: (value) => value !== watch('newPassword') || 'A nova senha não pode ser a mesma que a atual',
                  })}
                  error={errors.currentPassword?.message}
               />
            </div>

            <div className="mb-4 w-full">
               <Password label="Nova Senha" placeholder="Digite a nova senha" error={errors.newPassword?.message} {...register('newPassword')} />
            </div>

            <div className="mb-4 w-full">
               <Password
                  label="Confirmar Nova Senha"
                  placeholder="Confirme a nova senha"
                  size="lg"
                  className="[&>label>span]:font-medium"
                  inputClassName="text-sm"
                  {...register('confirmNewPassword', {
                     required: 'Confirmação de senha é obrigatória',
                     validate: (value) => value === watch('newPassword') || 'As senhas não conferem',
                  })}
                  error={errors.confirmNewPassword?.message}
               />
            </div>

            <Button type="submit" disabled={loading} className="mt-4 w-full">
               {loading ? 'Salvando...' : 'Alterar Senha'}
            </Button>
         </form>
      </div>
   );
};

export default ChangePassword;
