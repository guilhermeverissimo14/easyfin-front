'use client';

import React from 'react';
import { useModal } from '../modal-views/use-modal';
import { Button } from 'rizzui';
import { moneyMask } from '@/utils/format';
import { IAccountsPayable } from '@/types';
import Image from 'next/image';

interface AccountPayableDetailsProps {
   account: IAccountsPayable;
}

export const AccountPayableDetails = ({ account }: AccountPayableDetailsProps) => {
   const { closeModal } = useModal();

   const user = 'Eduardo Trindade'; // Buscar o usuário pelo account.userId

   return (
      <div>
         <div className="flex flex-row items-center justify-between pb-4 md:col-span-3">
            <div className="flex items-center">
               <p className="text-lg font-semibold">{account.supplierName}</p>
            </div>

            {account.status === 'Aberto' ? (
               <div className="w-22">
                  <div className="border-1 cursor-pointer rounded-md border border-[#ABD2EF] bg-[#ABD2EF] px-2 text-center text-xs text-white">
                     Aberto
                  </div>
               </div>
            ) : account.status === 'Atrasado' ? (
               <div className="w-22">
                  <div className="border-1 cursor-pointer rounded-md border border-red-400 bg-red-400 px-2 text-center text-xs text-white">
                     Vencido
                  </div>
               </div>
            ) : null}
         </div>

         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Data Lançamento</span>{' '}
                  <span className="p-1">{new Date(account.launchDate).toLocaleDateString('pt-BR')}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Data Emissão</span>
                  <span className="p-1">{new Date(account.launchDate).toLocaleDateString('pt-BR')}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Data Vencimento</span>{' '}
                  <span className="p-1">{new Date(account.dueDate).toLocaleDateString('pt-BR')}</span>
               </p>
            </div>

            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Documento</span> <span className="p-1">{account.documentNumber}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Parcelas</span>
                  <span className="p-1">
                     {account.installmentNumber} de {account.totalInstallments}
                  </span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Registrado por</span> <span className="p-1">{user}</span>
               </p>
            </div>
         </div>

         <div className="flex flex-row items-center justify-between py-4 md:col-span-3">
            <div className="flex items-center">
               <p className="text-lg font-semibold">Financeiro</p>
            </div>

            <Image src={'/images/contasapagar.png'} alt="Contas a Pagar" width={40} height={10} />
         </div>

         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Valor</span>
                  <span className="p-1">{moneyMask(String(account.value))}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Juros</span>
                  <span className="p-1">{moneyMask(String(account.interest))}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Multa</span> <span className="p-1">{moneyMask(String(account.fine))}</span>
               </p>
            </div>

            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Desconto</span> <span className="p-1">{moneyMask(String(account.discount))}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Centro de Custo</span>
                  <span className="p-1">Compras</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Método de Pagamento Previsto</span>
                  <span className="p-1">{account.plannedPaymentMethod}</span>
               </p>
            </div>
         </div>
      </div>
   );
};
