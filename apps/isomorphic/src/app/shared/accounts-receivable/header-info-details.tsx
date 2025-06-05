'use client';
import { useState } from 'react';

export const HeaderInfoDetails = () => {
   return (
      <div className="mx-auto mb-4 flex max-w-full items-start rounded-lg bg-[#3D8E7A] py-4 shadow-md">
         <div className="grid w-full grid-cols-1 gap-4 px-4 md:grid-cols-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">TOTAL RECEBIDO</span>
               <div className="text-3xl font-semibold text-[#17345F]">R$ 150,00</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">RECEBIDO ESTE MÊS</span>
               <div className="text-3xl font-semibold text-[#17345F]">R$ 150,00</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">RECEBIDO ESTA SEMANA</span>
               <div className="text-3xl font-semibold text-[#17345F]">R$ 0,00</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">RECEBIDO HOJE</span>
               <div className="text-3xl font-semibold text-[#17345F]">R$ 0,00</div>
            </div>
         </div>
      </div>
   );
};
