'use client';

import React, { useEffect, useState } from 'react';
import { useModal } from '../modal-views/use-modal';
import { formatCurrency } from '@/utils/format';
import { AccountsPayableResponse } from '@/types';
import Image from 'next/image';
import { api } from '@/service/api';
import { LoadingSpinner } from '@/components/loading-spinner';

interface AccountPayableDetailsProps {
   id: number;
}

export const AccountPayableDetails = ({ id: id }: AccountPayableDetailsProps) => {
   const { closeModal } = useModal();
   const [loading, setLoading] = useState(true);
   const [account, setAccount] = useState<AccountsPayableResponse | null>(null);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
     const fetchAccountDetails = async () => {
   
       try {
         setLoading(true);
         const response = await api.get(`/accounts-payable/${id}`);
         
         if (!response) {
           throw new Error(`Error fetching account details: ${response}`);
         }
         
         const data = await response.data;
         setAccount(data as AccountsPayableResponse);
       } catch (err) {
         console.error('Error fetching account details:', err);
         setError('Falha ao carregar os detalhes da conta');
         
         setAccount(id as any);
       } finally {
         setLoading(false);
       }
     };
     
     fetchAccountDetails();
   }, [id]);
   
   if (loading) {
       return (
         <div className="flex h-full w-full items-center justify-center p-10">
           <LoadingSpinner />
         </div>
       );
     }
   
   if (error && !account) {
     return <div className="text-red-500 p-4">{error}</div>;
   }
   
   if (!account) {
     return <div className="text-gray-500 p-4">Conta não encontrada</div>;
   }

   const supplierName = account.supplier?.name;
   const userName = account.user?.name;
   const costCenterName = account.costCenter?.name;
   const plannedPaymentMethodName = account.plannedPaymentMethod?.name;

   // Calcular o valor pago: valor - desconto + juros + multa
   const paidValue = account.value - (account.discount || 0) + (account.interest || 0) + (account.fine || 0);

   return (
      <div>
         <div className="flex flex-row items-center justify-between pb-4 md:col-span-3">
            <div className="flex items-center">
               <p className="text-lg font-semibold">{supplierName}</p>
            </div>

            {account.status === "PENDING" ? (
               <div className="w-22">
                 <div className="border-1 cursor-pointer rounded-md border border-[#ABD2EF] bg-[#ABD2EF] px-2 text-center text-xs text-white">
                   Aberto
                 </div>
               </div>
            ) : account.status === "OVERDUE" ? (
               <div className="w-22">
                 <div className="border-1 cursor-pointer rounded-md border border-red-400 bg-red-400 px-2 text-center text-xs text-white">
                   Vencido
                 </div>
               </div>
            ) : account.status === "PAID" ? (
               <div className="w-22">
                 <div className="border-1 cursor-pointer rounded-md border border-green-500 bg-green-500 px-2 text-center text-xs text-white">
                   Pago
                 </div>
               </div>
            ) : account.status === "CANCELLED" ? (
               <div className="w-22">
                 <div className="border-1 cursor-pointer rounded-md border border-gray-500 bg-gray-500 px-2 text-center text-xs text-white">
                   Cancelado
                 </div>
               </div>
            ) : null}
         </div>

         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Data Emissão</span>
                  <span className="p-1">{new Date(account.launchDate).toLocaleDateString('pt-BR')}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Data Documento</span>
                  <span className="p-1">{new Date(account.documentDate).toLocaleDateString('pt-BR')}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Data Vencimento</span>{' '}
                  <span className="p-1">{new Date(account.dueDate).toLocaleDateString('pt-BR')}</span>
               </p>
               {account.status === 'PAID' && account.paymentDate && (
                  <p className="flex flex-col text-sm text-gray-500">
                     <span className="bg-gray-100 p-1 font-semibold">Data Pagamento</span>
                     <span className="p-1 text-green-800 font-semibold">{new Date(account.paymentDate).toLocaleDateString('pt-BR')}</span>
                  </p>
               )}
            </div>

            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Documento</span> 
                  <span className="p-1">{account.documentNumber}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Parcela</span>
                  <span className="p-1">
                     {account.installmentNumber} de {account.totalInstallments}
                  </span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Registrado por</span> 
                  <span className="p-1">{userName}</span>
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
                  <span className="p-1">{formatCurrency(account.value)}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Juros</span>
                  <span className="p-1">{formatCurrency(account.interest || 0)}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Multa</span> 
                  <span className="p-1">{formatCurrency(account.fine || 0)}</span>
               </p>
               {account.status === 'PAID' && (
                  <p className="flex flex-col text-sm text-gray-500">
                     <span className="bg-green-100 p-1 font-semibold text-green-800">Valor Pago</span>
                     <span className="p-1 text-lg font-bold text-green-600">{formatCurrency(paidValue)}</span>
                  </p>
               )}
            </div>

            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Desconto</span> 
                  <span className="p-1">{formatCurrency(account.discount || 0)}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Centro de Custo</span>
                  <span className="p-1">{costCenterName || 'Não especificado'}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Método de Pagamento Previsto</span>
                  <span className="p-1">{plannedPaymentMethodName || 'Não especificado'}</span>
               </p>
               {account.status === 'PAID' && (
                  <p className="flex flex-col text-sm text-gray-500">
                     <span className="bg-green-100 p-1 font-semibold text-green-800">Método de Pagamento Realizado</span>
                     <span className="p-1 text-lg font-bold text-green-600">{account.plannedPaymentMethod?.name || 'Não especificado'}</span>
                  </p>
               )}
            </div>
         </div>
         
         {account.observation && (
           <div className="mt-4">
             <p className="flex flex-col text-sm text-gray-500">
                <span className="bg-gray-100 p-1 font-semibold">Observação</span>
                <span className="p-1">{account.observation}</span>
             </p>
           </div>
         )}
      </div>
   );
};