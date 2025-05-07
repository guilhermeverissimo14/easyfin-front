import Image from 'next/image';

import { metaObject } from '@/config/site.config';
import SignInForm from './sign-in-form';

export const metadata = {
   ...metaObject('Entrar'),
};

export default function SignIn() {
   return (
      <main className="relative flex justify-center  h-screen flex-row bg-gray-100">
         <div className="relative z-10 flex h-screen w-[100%] flex-col items-center justify-center xl:w-[40%]">
            <div className="w-[100%] h-screen md:h-auto rounded-lg bg-white p-8 shadow-lg xl:w-[600px]">
                  <div className="mb-8 flex w-full justify-center">
                    <Image
                      alt="Logo"
                      src="/images/logo_principal.png"
                      width={230}
                      height={150}
                    />
                  </div>
               <SignInForm />
            </div>
         </div>
      </main>
   );
}
