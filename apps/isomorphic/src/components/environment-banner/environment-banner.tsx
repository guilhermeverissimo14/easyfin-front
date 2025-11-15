'use client';

import { useEffect } from 'react';

export default function EnvironmentBanner() {
   const environment = process.env.NEXT_PUBLIC_ENVIRONMENT;

   useEffect(() => {
      if (environment === 'homolog') {
         // Adiciona classe ao body para ajustar padding
         document.body.classList.add('has-env-banner');
         
         // Adiciona estilo global
         const style = document.createElement('style');
         style.id = 'env-banner-styles';
         style.innerHTML = `
            body.has-env-banner {
               padding-top: 40px;
            }
            
            @media (max-width: 640px) {
               body.has-env-banner {
                  padding-top: 36px;
               }
            }
         `;
         document.head.appendChild(style);
      }

      return () => {
         document.body.classList.remove('has-env-banner');
         const style = document.getElementById('env-banner-styles');
         if (style) {
            style.remove();
         }
      };
   }, [environment]); 

   if (environment !== 'homolog') {
      return null;
   }

   return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-white px-4 py-2 shadow-lg border-b-2 border-orange-600">
         <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
               <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
               </div>
               <span className="font-bold text-sm sm:text-base uppercase tracking-wider">
                  🚧 Ambiente de Homologação
               </span>
            </div>
            <span className="hidden sm:inline text-xs opacity-90">
               Este não é o ambiente de produção
            </span>
         </div>
      </div>
   );
}
