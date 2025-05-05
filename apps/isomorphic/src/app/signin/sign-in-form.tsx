'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { SubmitHandler } from 'react-hook-form';
import { PiArrowRightBold } from 'react-icons/pi';
import { Checkbox, Password, Button, Input } from 'rizzui';
import { Form } from '@core/ui/form';
import { loginSchema, LoginSchema } from '@/validators/login.schema';
import { loginUser } from '@/service/auth/authService';
import { CustomErrorLogin, User } from '@/types';
import { redirect } from 'next/navigation';
import { toast } from "react-toastify";
import axios from 'axios';

const initialValues: LoginSchema = {
   email: '',
   password: '',
   rememberMe: true,
};

export default function SignInForm() {

   const [reset, setReset] = useState({});
   const [loading, setLoading] = useState(false);
   const [onSubmited, setOnSubmited] = useState(false);

   useEffect(() => {

      const isAuthenticated = localStorage.getItem('eas:isAuthenticated');
      const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

      if (isAuthenticated) {
         if (userRole === 'FINANCIAL') {
            redirect('/user-financial');
         } else if (userRole === 'ADMIN' || userRole === 'MANAGER') {
            redirect('/dashboard-admin');
         } else if (userRole === 'PILOT') {
            redirect('/dashboard-pilot');
         } else if (userRole === 'LOCAL_MANAGER') {
            redirect('/dashboard-local-manager');
         }
      }
   }, [onSubmited]);

   const onSubmit: SubmitHandler<LoginSchema> = async (data, event) => {
      event?.preventDefault();
      try {
         setLoading(true);
         const response: User | null = await loginUser(data.email, data.password);

         if (!response) {
            return;
         }

         await signIn('credentials', {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            token: response.token,
         });

         setReset({});
         setOnSubmited(true);
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

   async function getHealthCheck() {
      try {
         await axios.get('https://minas-drones-api.onrender.com/healthcheck');
      } catch (error) {
         console.log(error);
      }
   }

   useEffect(() => {
      getHealthCheck();
   }, []);

   return (
      <>
         <Form<LoginSchema>
            validationSchema={loginSchema}
            resetValues={reset}
            onSubmit={onSubmit}
            useFormProps={{
               defaultValues: initialValues,
            }}
         >
            {({ register, formState: { errors } }) => (
               <div className="space-y-5">
                  <Input
                     type="email"
                     size="lg"
                     label="E-mail"
                     placeholder="Digite seu email"
                     className="[&>label>span]:font-medium"
                     inputClassName="text-sm"
                     {...register('email')}
                     error={errors.email?.message}
                  />
                  <Password
                     label="Senha"
                     placeholder="Digite sua senha"
                     size="lg"
                     className="[&>label>span]:font-medium"
                     inputClassName="text-sm"
                     {...register('password')}
                     error={errors.password?.message}
                  />
                  <div className="flex items-center justify-between pb-2">
                     <Checkbox {...register('rememberMe')} label="Lembrar minha senha" className="[&>label>span]:font-medium" />
                     <Link
                        href={'/forgot-password'}
                        className="h-auto p-0 text-sm font-semibold text-gray-600 underline transition-colors hover:text-gray-900 hover:no-underline"
                     >
                        Esqueceu a senha?
                     </Link>
                  </div>
                  <Button className="w-full" type="submit" size="lg" disabled={loading}>
                     {!loading ? (
                        <>
                           <span>Entrar</span> <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
                        </>
                     ) : (
                        <span>Carregando...</span>
                     )}
                  </Button>
               </div>
            )}
         </Form>
      </>
   );
}
