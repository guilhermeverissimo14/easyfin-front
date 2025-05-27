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
      <div className="mx-auto mb-4 flex max-w-full items-start rounded-lg bg-[#CEBDA3] py-4 shadow-md">
         {/* Imagem à esquerda */}
         {/* <div className="flex-shrink-0">
            <Image alt="Calculadora" src="/images/calculadora.png" width={90} height={50} />
         </div> */}
         <div className="grid w-full grid-cols-1 gap-4 px-4 md:grid-cols-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">TOTAL VENCIDO</span>
               <div className="text-3xl font-semibold text-[#17345F]">R$ 150,00</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">VENCIDO ESTE MÊS</span>
               <div className="text-3xl font-semibold text-[#17345F]">R$ 150,00</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">VENCIDO ESTA SEMANA</span>
               <div className="text-3xl font-semibold text-[#17345F]">R$ 0,00</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">VENCIDO HOJE</span>
               <div className="text-3xl font-semibold text-[#17345F]">R$ 0,00</div>
            </div>
         </div>
      </div>
   );
};
