'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input } from 'rizzui';
import { toast } from "react-toastify";

import { PiEnvelopeSimple } from 'react-icons/pi';
import { api } from '@/service/api';
import { CustomErrorLogin } from '@/types';

const forgotPasswordSchema = z.object({
  email: z.string().email('Formato de e-mail inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;


export default function ForgotPassword() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await api.post('auth/forgot-password', data);
      toast.success('E-mail de recuperação enviado com sucesso!');
      localStorage.setItem('eas:resetEmail', data.email);
      router.push('/reset-password');
    } catch (error) {
      const err = error as CustomErrorLogin;

      if (err.message === 'Network Error') {
        toast.error('Erro de conexão, tente novamente mais tarde');
      } else {
        toast.error(err.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center h-screen flex-row bg-gray-100">
      
      <div className="relative z-10 flex h-screen w-[100%] flex-col items-center justify-center bg-gray-100 lg:bg-gray-100 xl:w-[40%]">
        <div className="w-[100%] h-screen md:h-auto rounded-lg bg-white p-8 shadow-lg md:w-[600px]">
          <div className="mb-8 flex w-full justify-center">
            <Image alt="Logo" src="/images/logo_principal.png" width={230} height={150} />
          </div>
          <div className="mb-8">
            <p className="text-md text-center font-normal text-gray-800">
              Esqueceu sua senha? Não se preocupe! Informe seu e-mail e
              enviaremos um código para recuperação.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <Input
                type="email"
                size="lg"
                label="E-mail"
                placeholder="Digite seu email"
                className="[&>label>span]:font-medium"
                {...register('email')}
                inputClassName="text-sm"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
              <Button disabled={loading} className="w-full" type="submit" size="lg">
                <span>{loading ? 'Enviando...' : 'Enviar E-mail'}</span>
                <PiEnvelopeSimple className="ms-2 mt-0.5 h-5 w-5" />
              </Button>
              <div className="flex items-center justify-end pb-2">
                <Link
                  href="/signin"
                  className="text-sm font-normal text-gray-600 underline transition-colors hover:text-gray-900 hover:no-underline"
                >
                  Voltar para login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
