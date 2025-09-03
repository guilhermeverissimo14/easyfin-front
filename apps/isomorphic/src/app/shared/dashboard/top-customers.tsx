'use client';

import { useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { Avatar, Text, Badge } from 'rizzui';
import useApi from '@/hooks/useApi';
import cn from '@core/utils/class-names';
import { formatDate, formatCurrency } from '@/utils/format';
import { PiUser, PiCurrencyDollar, PiTrendUp, PiCalendarBlank } from 'react-icons/pi';

interface Customer {
   id: string;
   name: string;
   cnpj: string;
   email: string;
   totalValue: number;
   totalInvoices: number;
   totalReceived: number;
   pendingValue: number;
   avatar?: string;
}

export default function TopCustomers({ className }: { className?: string }) {
   const { data: customers, loading, error } = useApi<Customer[]>('/dashboard/top-customers');

   const mockData: Customer[] = [
      {
         id: '13e5911e-0013-45f6-81c9-6b1bc3ae38d5',
         name: 'Douglas teste',
         cnpj: '29.798.0210001/86',
         email: 'douglassantoti@gmail.com',
         totalValue: 3600,
         totalInvoices: 2,
         totalReceived: 2000,
         pendingValue: 1600,
      },
      {
         id: '6f2e3ca4-3d95-4e06-8f26-a464082363bf',
         name: 'Teste',
         cnpj: '01.640.2620001/83',
         email: 'douglas.santos@citopharma.com.br',
         totalValue: 999.99,
         totalInvoices: 1,
         totalReceived: 666.66,
         pendingValue: 333.33,
      },
      {
         id: '7a3b4c5d-6e7f-8g9h-0i1j-2k3l4m5n6o7p',
         name: 'João Silva',
         cnpj: '12.345.6780001/90',
         email: 'joao@empresa.com',
         totalValue: 5000,
         totalInvoices: 3,
         totalReceived: 3000,
         pendingValue: 2000,
      },
      {
         id: '8b4c5d6e-7f8g-9h0i-1j2k-3l4m5n6o7p8q',
         name: 'Maria Santos',
         cnpj: '98.765.4320001/12',
         email: 'maria@comercio.com',
         totalValue: 2500,
         totalInvoices: 1,
         totalReceived: 2500,
         pendingValue: 0,
      },
      {
         id: '9c5d6e7f-8g9h-0i1j-2k3l-4m5n6o7p8q9r',
         name: 'Pedro Costa',
         cnpj: '11.222.3330001/44',
         email: 'pedro@industria.com',
         totalValue: 1800,
         totalInvoices: 2,
         totalReceived: 900,
         pendingValue: 900,
      },
   ];

   const displayData = customers || mockData;

   const getStatusBadge = (pendingValue: number) => {
      return pendingValue === 0 ? (
         <Badge variant="flat" color="success" className="text-xs">
            Quitado
         </Badge>
      ) : (
         <Badge variant="flat" color="warning" className="text-xs">
            Pendente
         </Badge>
      );
   };

   if (loading) {
      return (
         <WidgetCard title="Principais Clientes" titleClassName="text-gray-700 font-bold font-inter" className={cn('min-h-[28rem]', className)}>
            <div className="space-y-4">
               {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                           <div className="h-4 w-32 rounded bg-gray-200"></div>
                           <div className="mt-1 h-3 w-24 rounded bg-gray-200"></div>
                        </div>
                        <div className="h-6 w-16 rounded bg-gray-200"></div>
                     </div>
                  </div>
               ))}
            </div>
         </WidgetCard>
      );
   }

   if (error) {
      return (
         <WidgetCard title="Principais Clientes" titleClassName="text-gray-700 font-bold font-inter" className={cn('min-h-[28rem]', className)}>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
               <Text className="text-red-600">Erro ao carregar clientes: {error}</Text>
            </div>
         </WidgetCard>
      );
   }

   return (
      <WidgetCard
         title="Principais Clientes"
         titleClassName="text-gray-700 font-bold font-inter"
         headerClassName="items-center"
         className={cn('min-h-[28rem]', className)}
      >
         <div className="mt-4 space-y-4">
            {displayData.map((customer, index) => (
               <div
                  key={customer.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
               >
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <Avatar src={customer.avatar} name={customer.name} className="h-10 w-10" />
                        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                           {index + 1}
                        </div>
                     </div>
                     <div className="flex-1">
                        <Text className="font-medium text-gray-900">{customer.name}</Text>
                        <Text className="text-sm text-gray-500">{customer.email}</Text>
                        <Text className="text-xs text-gray-400">CNPJ: {customer.cnpj}</Text>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="flex items-center gap-1 text-green-600">
                        <Text className="font-semibold">{formatCurrency(customer.totalValue)}</Text>
                     </div>
                     <div className="mt-1">{getStatusBadge(customer.pendingValue)}</div>
                  </div>
               </div>
            ))}
         </div>

         {(!displayData || displayData.length === 0) && (
            <div className="flex h-[500px] flex-col items-center justify-center text-center">
               <PiCalendarBlank className="h-16 w-16 text-gray-300" />
               <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Nenhum lançamento encontrado
               </h3>
               <p className="text-sm text-gray-500 max-w-sm">
                  Não foram encontrados lançamentos financeiros ou contas a receber no período selecionado. 
                  Tente ajustar o filtro de datas ou verifique se há movimentações cadastradas.
               </p>
            </div>
         )}
      </WidgetCard>
   );
}
