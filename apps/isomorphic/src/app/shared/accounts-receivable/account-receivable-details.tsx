'use client';

import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/utils/format';
import { AccountsReceivableResponse } from '@/types';
import { api } from '@/service/api';
import { LoadingSpinner } from '@/components/loading-spinner';

interface AccountReceivableDetailsProps {
   id: number;
}

export const AccountReceivableDetails = ({ id }: AccountReceivableDetailsProps) => {
   const [loading, setLoading] = useState(true);
   const [account, setAccount] = useState<AccountsReceivableResponse | null>(null);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchAccountDetails = async () => {
         try {
            setLoading(true);
            const response = await api.get(`/accounts-receivable/${id}`);

            if (!response) {
               throw new Error(`Error fetching account details: ${response}`);
            }

            const data = await response.data;
            setAccount(data as AccountsReceivableResponse);
         } catch (err) {
            console.error('Error fetching account details:', err);
            setError('Falha ao carregar os detalhes da conta');
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
      return <div className="p-4 text-red-500">{error}</div>;
   }

   if (!account) {
      return <div className="p-4 text-gray-500">Conta não encontrada</div>;
   }

   const customerName = account.customer?.name;
   const userName = account.user?.name;
   const costCenterName = account.costCenter?.name;
   const plannedPaymentMethodName = account.plannedPaymentMethod?.name;

   return (
      <div>
         <div className="flex flex-row items-center justify-between pb-4 md:col-span-3">
            <div className="flex items-center">
               <p className="text-lg font-semibold">{customerName}</p>
            </div>

            {account.status === 'PENDING' ? (
               <div className="w-22">
                  <div className="border-1 cursor-pointer rounded-md border border-[#ABD2EF] bg-[#ABD2EF] px-2 text-center text-xs text-white">
                     Aberto
                  </div>
               </div>
            ) : account.status === 'OVERDUE' ? (
               <div className="w-22">
                  <div className="border-1 cursor-pointer rounded-md border border-red-400 bg-red-400 px-2 text-center text-xs text-white">
                     Vencido
                  </div>
               </div>
            ) : account.status === 'PAID' ? (
               <div className="w-22">
                  <div className="border-1 cursor-pointer rounded-md border border-green-500 bg-green-500 px-2 text-center text-xs text-white">
                     Pago
                  </div>
               </div>
            ) : account.status === 'CANCELLED' ? (
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
            </div>

            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Documento</span> <span className="p-1">{account.documentNumber}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Parcela</span>
                  <span className="p-1">
                     {account.installmentNumber} de {account.totalInstallments}
                  </span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Registrado por</span> <span className="p-1">{userName}</span>
               </p>
            </div>
         </div>

         <div className="flex flex-row items-center justify-between py-4 md:col-span-3">
            <div className="flex items-center">
               <p className="text-lg font-semibold">Financeiro</p>
            </div>
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
                  <span className="bg-gray-100 p-1 font-semibold">Multa</span> <span className="p-1">{formatCurrency(account.fine || 0)}</span>
               </p>
            </div>

            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Desconto</span> <span className="p-1">{formatCurrency(account.discount || 0)}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Centro de Custo</span>
                  <span className="p-1">{costCenterName || 'Não especificado'}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Método de Pagamento Previsto</span>
                  <span className="p-1">{plannedPaymentMethodName || 'Não especificado'}</span>
               </p>
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
