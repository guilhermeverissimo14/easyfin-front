'use client';

import { useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { Avatar, Text, Badge } from 'rizzui';
import useApi from '@/hooks/useApi';
import cn from '@core/utils/class-names';
import { formatCurrency } from '@/utils/format';
import { PiBuildings, PiCalendarBlank } from 'react-icons/pi';

interface Supplier {
   id: string;
   name: string;
   cnpj: string;
   email: string;
   totalValue: number;
   totalAccounts: number;
   totalPaid: number;
   pendingValue: number;
   avatar?: string;
}

interface TopSuppliersProps {
   className?: string;
   startDate?: Date | null;
   endDate?: Date | null;
   apiUrl?: string;
}

export default function TopSuppliers({ 
   className, 
   startDate, 
   endDate, 
   apiUrl = '/dashboard/top-suppliers' 
}: TopSuppliersProps) {
   const { data: suppliers, loading, error } = useApi<Supplier[]>(apiUrl);

   const mockData: Supplier[] = [
      {
         id: 'ac092e0e-c062-43f7-8aff-49fd6b323b2f',
         name: 'Douglas',
         cnpj: '29.798.0210001/86',
         email: 'douglassantoti@gmail.com',
         totalValue: 5200,
         totalAccounts: 5,
         totalPaid: 2800,
         pendingValue: 2400,
      },
      {
         id: 'bd193f1f-d173-48g8-9bgg-50ge7c434c3g',
         name: 'Fornecedor ABC Ltda',
         cnpj: '12.345.6780001/90',
         email: 'contato@abc.com',
         totalValue: 8500,
         totalAccounts: 3,
         totalPaid: 6000,
         pendingValue: 2500,
      },
      {
         id: 'ce2a4g2g-e284-59h9-0chh-61hf8d545d4h',
         name: 'Distribuidora XYZ',
         cnpj: '98.765.4320001/12',
         email: 'vendas@xyz.com',
         totalValue: 7200,
         totalAccounts: 4,
         totalPaid: 7200,
         pendingValue: 0,
      },
      {
         id: 'df3b5h3h-f395-60i0-1dii-72ig9e656e5i',
         name: 'Serviços DEF',
         cnpj: '11.222.3330001/44',
         email: 'admin@def.com',
         totalValue: 6500,
         totalAccounts: 2,
         totalPaid: 3000,
         pendingValue: 3500,
      },
      {
         id: 'eg4c6i4i-g4a6-71j1-2ejj-83jh0f767f6j',
         name: 'Indústria GHI',
         cnpj: '55.666.7770001/88',
         email: 'comercial@ghi.com',
         totalValue: 4500,
         totalAccounts: 3,
         totalPaid: 4500,
         pendingValue: 0,
      },
   ];

   const displayData = suppliers || mockData;

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

   const getCategoryColor = (category: string) => {
      const colors: { [key: string]: string } = {
         Tecnologia: 'bg-blue-100 text-blue-600',
         Materiais: 'bg-green-100 text-green-600',
         Serviços: 'bg-purple-100 text-purple-600',
         Equipamentos: 'bg-orange-100 text-orange-600',
         default: 'bg-gray-100 text-gray-600',
      };
      return colors[category] || colors['default'];
   };

   if (loading) {
      return (
         <WidgetCard title="Principais Fornecedores" titleClassName="text-gray-700 font-bold font-inter" className={cn('min-h-[28rem]', className)}>
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
         <WidgetCard title="Principais Fornecedores" titleClassName="text-gray-700 font-bold font-inter" className={cn('min-h-[28rem]', className)}>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
               <Text className="text-red-600">Erro ao carregar fornecedores: {error}</Text>
            </div>
         </WidgetCard>
      );
   }

   return (
      <WidgetCard
         title="Principais Fornecedores"
         titleClassName="text-gray-700 font-bold font-inter"
         headerClassName="items-center"
         className={cn('min-h-[28rem]', className)}
      >
         <div className="mt-4 space-y-4">
            {displayData.map((supplier, index) => (
               <div
                  key={supplier.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
               >
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <Avatar src={supplier.avatar} name={supplier.name} className="h-10 w-10" />
                        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                           {index + 1}
                        </div>
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <Text className="font-medium text-gray-900">{supplier.name}</Text>
                        </div>
                        <Text className="text-sm text-gray-500">{supplier.email}</Text>
                        <Text className="text-xs text-gray-400">CNPJ: {supplier.cnpj}</Text>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="flex items-center gap-1 text-green-600">
                        <Text className="font-semibold">{formatCurrency(supplier.totalValue)}</Text>
                     </div>
                     <div className="mt-1">{getStatusBadge(supplier.pendingValue)}</div>
                  </div>
               </div>
            ))}
         </div>

         {(!displayData || displayData.length === 0) && (
            <div className="mt-5 flex flex-col items-center justify-center h-[500px] text-center">
               <PiCalendarBlank className="w-16 h-16 text-gray-300 mb-4" />
               <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Nenhum lançamento encontrado
               </h3>
               <p className="text-sm text-gray-500 max-w-sm">
                  Não foram encontrados lançamentos financeiros ou contas a pagar no período selecionado. 
                  Tente ajustar o filtro de datas ou verifique se há movimentações cadastradas.
               </p>
            </div>
         )}
      </WidgetCard>
   );
}
