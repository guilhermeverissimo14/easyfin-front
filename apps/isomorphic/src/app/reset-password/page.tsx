'use client';

import Image from 'next/image';
import Link from 'next/link';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Password } from 'rizzui';
import { toast } from "react-toastify";

import { api } from '@/service/api';
import { CustomErrorLogin } from '@/types';
import OtpForm from '@/components/otp/otp-form';

const resetPasswordSchema = z.object({
   code: z.string().length(6, 'O código deve ter exatamente 6 dígitos'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
   const router = useRouter();

   const [loading, setLoading] = useState(false);
   const [verified, setVerified] = useState(false);
   const [code, setCode] = useState('');
   const storedEmail = localStorage.getItem('eas:resetEmail');
   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [attemptsResend, setAttemptsResend] = useState(0);
   const [showMsgError, setShowMsgError] = useState(false);

   const verifyPasswords = () => {
      if (
         newPassword.length > 5 &&
         confirmPassword.length > 5 &&
         newPassword === confirmPassword
      ) {
         return true;
      } else if (
         newPassword.length > 5 &&
         confirmPassword.length > 5 &&
         newPassword !== confirmPassword
      ) {
         return false;
      } else if (newPassword.length < 6 && confirmPassword.length < 6) {
         return null;
      } else return false;
   };

   const verifyCode = async (data: ResetPasswordFormData) => {
      try {
         setLoading(true);
         const { code } = data;
         const response = await api.post('auth/verify-code', {
            email: storedEmail,
            code,
         });
         if (response.status === 200) {
            setVerified(true);
         }
      } catch (error) {
         const err = error as CustomErrorLogin;
         setVerified(false);
         if (err.message === 'Network Error') {
            toast.error('Erro de conexão, tente novamente mais tarde');
         } else {
            toast.error(err.response.data.message);
         }
      } finally {
         setLoading(false);
      }
   };

   const handleResendCode = async () => {
      if (attemptsResend >= 3) {
         toast.error(
            'Você atingiu o limite de tentativas, tente novamente mais tarde'
         );
         return;
      }
      try {
         setLoading(true);
         await api.post('auth/forgot-password', {
            email: storedEmail,
         });
         setAttemptsResend(attemptsResend + 1);
         toast.success('Código reenviado com sucesso!');
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

   const onSubmit = async () => {
      if (verifyPasswords() === false) {
         setShowMsgError(true);
         return;
      }

      setShowMsgError(false);

      try {
         setLoading(true);
         const payload = {
            email: storedEmail,
            code,
            newPassword,
         };
         // console.log('Payload', payload);
         await api.post('auth/reset-password', payload);
         toast.success('Senha redefinida com sucesso!');
         setTimeout(() => {
            router.push('/signin');
         }, 1000);
      } catch (error) {
         const err = error as CustomErrorLogin;

         if (err.message === 'Network Error') {
            toast.error('Erro de conexão, tente novamente mais tarde');
         } else {
            toast.error(err.response.data.message);
         }
      } finally {
         setLoading(false);
         localStorage.removeItem('eas:resetEmail');
      }
   };

   return (
      <div className="relative flex justify-center h-screen flex-row bg-gray-100">
      
         <div className="relative z-10 flex h-screen w-[100%] flex-col items-center justify-center bg-gray-100 lg:bg-gray-100 xl:w-[40%]">
            <div className="w-[100%] h-screen md:h-auto rounded-lg bg-white p-8 shadow-lg md:w-[600px]">
               <div className="mb-8 flex w-full justify-center">
                  <Image
                     alt="Logo"
                     src="/images/logo.png"
                     width={230}
                     height={150}
                  />
               </div>

               <div className="space-y-8">
                  {!verified && (
                     <>
                        <div className="mb-8">
                           <p className="text-md text-center font-normal text-gray-800">
                              Informe o código de validação enviado para o seu
                              e-mail
                           </p>
                        </div>
                        <OtpForm
                           onVerify={(code) => {
                              verifyCode({ code });
                              setCode(code);
                           }}
                           resendCode={() => {
                              handleResendCode();
                           }}
                        />
                     </>
                  )}
               </div>

               <div className="space-y-8">
                  {verified && (
                     <>
                        <div className="mb-8">
                           <p className="text-md text-center font-normal text-gray-800">
                              Código validado com sucesso! Agora informe sua
                              nova senha
                           </p>
                        </div>
                        <Password
                           label="Nova senha"
                           placeholder="Informe sua nova senha"
                           size="lg"
                           className="[&>label>span]:font-medium"
                           inputClassName="text-sm"
                           onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Password
                           label="Repita a nova senha"
                           placeholder="Repita sua nova senha"
                           size="lg"
                           className="[&>label>span]:font-medium"
                           inputClassName="text-sm"
                           onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {showMsgError && (
                           <p className="text-sm text-red-500">
                              As senhas não conferem
                           </p>
                        )}
                        <Button
                           className="w-full"
                           onClick={onSubmit}
                           size="lg"
                           disabled={loading}
                        >
                           {loading
                              ? 'Aguarde um momento...'
                              : 'Redefinir Senha'}
                        </Button>
                     </>
                  )}
                  <div className="mt-4 flex items-center justify-end pb-2">
                     <Link
                        href="/signin"
                        className="text-sm font-normal text-gray-600 underline transition-colors hover:text-gray-900 hover:no-underline"
                     >
                        Voltar para o login
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
