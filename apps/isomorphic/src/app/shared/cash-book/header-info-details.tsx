'use client';
import { useState } from 'react';
import Image from 'next/image';
import { IoCalendarOutline } from 'react-icons/io5';
import { FaDotCircle } from 'react-icons/fa';
import { CustomTooltip } from '@/components/custom-tooltip';

export const HeaderInfoDetails = () => {
   const [loading, setLoading] = useState(false);

   const date = '26/05/2025'; // Quanto integrar, substituir pela data atual!
   const entradas = '0,00 (Entradas)';
   const saidas = '200,00 (Saídas)';
   const saldo = 'R$ 4.950,00';
   const acconuntSelected = 'Ag. 1234 - CC 56789-0';

   return (
      <div className="flex flex-col items-center gap-4 bg-white px-4 py-2 md:flex-row md:justify-between md:gap-0">
         <div className="flex flex-1 items-center space-x-4">
            <Image alt="Logo" src="/images/cashier.png" width={180} height={150} />

            <div className="flex w-full flex-col justify-center space-y-2 text-sm text-gray-700 md:w-auto md:text-base">
               <div className="flex flex-row items-center space-x-2 text-gray-600">
                  <IoCalendarOutline size={26} />
                  <span className="text-xl font-semibold md:text-2xl">{date}</span>
               </div>
               <div className="ml-1 flex items-center space-x-3 text-green-600">
                  <FaDotCircle className="inline-block" />
                  <span className="text-gray-500">{`R$ ${entradas}`}</span>
               </div>
               <div className="ml-1 flex items-center space-x-3 text-red-600">
                  <FaDotCircle className="inline-block" />
                  <span className="text-gray-500">{`R$ ${saidas}`}</span>
               </div>
            </div>
         </div>

         <div className="flex w-full items-center justify-center md:w-1/4">
            <CustomTooltip text="Clique aqui para selecionar outra conta">
               <div className="flex cursor-pointer flex-col items-center justify-center space-y-1 md:items-end">
                  <span className="text-sm text-gray-500 md:text-base">Banco do Brasil</span>
                  <div className="text-base font-semibold md:text-lg">{acconuntSelected}</div>
               </div>
            </CustomTooltip>
         </div>

         <div className="flex w-full items-center justify-center md:w-1/4 md:justify-end">
            <div className="flex flex-col items-center justify-center space-y-1 md:items-end">
               <span className="text-sm text-gray-500 md:text-base">Saldo</span>
               <div className="text-lg font-semibold md:text-xl">{saldo}</div>
            </div>
         </div>
      </div>
   );
};
