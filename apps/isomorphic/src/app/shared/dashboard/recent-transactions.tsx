'use client';

import { useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { Text, Badge, Button } from 'rizzui';
import useApi from '@/hooks/useApi';
import cn from '@core/utils/class-names';
import { formatDate, formatCurrency } from '@/utils/format';
import { PiArrowUp, PiArrowDown, PiClock, PiEye, PiCaretRight } from 'react-icons/pi';
import { format } from 'date-fns';

interface Transaction {
   id: string;
   type: 'receivable' | 'payable' | 'cash-flow';
   description: string;
   value: number;
   date: string;
   status: 'PENDING' | 'PAID' | 'Entrada' | 'Saída';
   customerName?: string;
   supplierName?: string;
   documentNumber?: string;
}

interface DisplayTransaction {
   id: string;
   type: 'income' | 'expense';
   description: string;
   amount: number;
   date: string;
   category: string;
   status: 'completed' | 'pending' | 'cancelled';
   customerName?: string;
   supplierName?: string;
}

interface RecentTransactionsProps {
   className?: string;
   startDate?: Date | null;
   endDate?: Date | null;
}

export default function RecentTransactions({ className, startDate, endDate }: RecentTransactionsProps) {
   const [showAll, setShowAll] = useState(false);

   // Construir URL da API com filtros de data
   const buildApiUrl = () => {
      let url = '/dashboard/recent-transactions';
      const params = new URLSearchParams();
      
      if (startDate) {
         params.append('startDate', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
         params.append('endDate', format(endDate, 'yyyy-MM-dd'));
      }
      
      return params.toString() ? `${url}?${params.toString()}` : url;
   };

   const { data: transactions, loading, error } = useApi<Transaction[]>(buildApiUrl());

   const transformToDisplayData = (apiData: Transaction[]): DisplayTransaction[] => {
      return apiData.map((transaction) => {
         let displayType: 'income' | 'expense';
         let category: string;
         let displayStatus: 'completed' | 'pending' | 'cancelled';

         if (transaction.type === 'receivable' || (transaction.type === 'cash-flow' && transaction.status === 'Entrada')) {
            displayType = 'income';
         } else {
            displayType = 'expense';
         }

         if (transaction.type === 'receivable') {
            category = 'Contas a Receber';
         } else if (transaction.type === 'payable') {
            category = 'Contas a Pagar';
         } else {
            category = 'Fluxo de Caixa';
         }

         if (transaction.status === 'PAID' || transaction.status === 'Entrada' || transaction.status === 'Saída') {
            displayStatus = 'completed';
         } else if (transaction.status === 'PENDING') {
            displayStatus = 'pending';
         } else {
            displayStatus = 'cancelled';
         }

         return {
            id: transaction.id,
            type: displayType,
            description: transaction.description,
            amount: transaction.value,
            date: transaction.date,
            category,
            status: displayStatus,
            customerName: transaction.customerName,
            supplierName: transaction.supplierName,
         };
      });
   };

   const rawData = transactions || [];
   const displayData = transformToDisplayData(rawData);

   const getStatusBadge = (status: string) => {
      const statusConfig = {
         completed: { color: 'success' as const, label: 'Concluído' },
         pending: { color: 'warning' as const, label: 'Pendente' },
         cancelled: { color: 'danger' as const, label: 'Cancelado' },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

      return (
         <Badge variant="flat" color={config.color} className="text-xs">
            {config.label}
         </Badge>
      );
   };

   const getTransactionIcon = (type: string) => {
      return type === 'income' ? (
         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <PiArrowUp className="h-4 w-4 text-green-600" />
         </div>
      ) : (
         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
            <PiArrowDown className="h-4 w-4 text-red-600" />
         </div>
      );
   };

   const displayedTransactions = showAll ? displayData : displayData.slice(0, 5);

   if (loading) {
      return (
         <WidgetCard title="Transações Recentes" titleClassName="text-gray-700 font-bold font-inter" className={cn('min-h-[28rem]', className)}>
            <div className="mt-4 space-y-4">
               {[...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                           <div className="h-4 w-48 rounded bg-gray-200"></div>
                           <div className="mt-1 h-3 w-32 rounded bg-gray-200"></div>
                        </div>
                        <div className="h-6 w-20 rounded bg-gray-200"></div>
                     </div>
                  </div>
               ))}
            </div>
         </WidgetCard>
      );
   }

   if (error) {
      return (
         <WidgetCard title="Transações Recentes" titleClassName="text-gray-700 font-bold font-inter" className={cn('min-h-[28rem]', className)}>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
               <Text className="text-red-600">Erro ao carregar transações: {error}</Text>
            </div>
         </WidgetCard>
      );
   }

   return (
      <WidgetCard
         title="Transações Recentes"
         titleClassName="text-gray-700 font-bold font-inter"
         headerClassName="items-center"
         className={cn('min-h-[28rem]', className)}
         action={
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 text-orange-600">
                  <PiClock className="h-4 w-4" />
                  <span className="text-sm font-medium">{rawData.filter((t) => t.status === 'PENDING').length} pendentes</span>
               </div>
               <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => setShowAll(!showAll)}>
                  <PiEye className="h-4 w-4 mr-2" />
                  {showAll ? 'Ver menos' : 'Ver todas'}
               </Button>
            </div>
         }
      >
         <div className="my-4 grid grid-cols-2 gap-4 @lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
               <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-gradient-to-br from-blue-200/30 to-blue-300/20 blur-xl" />
               <div className="relative">
                  <Text className="text-sm font-medium text-blue-700">Total de Transações</Text>
                  <Text className="text-xl font-bold text-blue-900">{displayData.length}</Text>
               </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
               <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-gradient-to-br from-green-200/30 to-green-300/20 blur-xl" />
               <div className="relative">
                  <Text className="text-sm font-medium text-green-700">Receitas</Text>
                  <Text className="text-xl font-bold text-green-900">
                     {rawData.filter((t) => t.type === 'receivable' || (t.type === 'cash-flow' && t.status === 'Entrada')).length}
                  </Text>
               </div>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-red-200/50 bg-gradient-to-br from-red-50 to-red-100/50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
               <div className="absolute -right-2 -top-2 h-12 w-12 rounded-full bg-gradient-to-br from-red-200/30 to-red-300/20 blur-xl" />
               <div className="relative">
                  <Text className="text-sm font-medium text-red-700">Despesas</Text>
                  <Text className="text-xl font-bold text-red-900">
                     {rawData.filter((t) => t.type === 'payable' || (t.type === 'cash-flow' && t.status === 'Saída')).length}
                  </Text>
               </div>
            </div>
         </div>

         <div className="space-y-3">
            {displayedTransactions.map((transaction) => (
               <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-gradient-to-r from-white to-gray-50/30 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300/60 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white hover:shadow-md"
               >
                  <div className="flex items-center gap-3">
                     {getTransactionIcon(transaction.type)}
                     <div className="flex-1">
                        <div className="flex items-center gap-2">
                           <Text className="font-medium text-gray-900">{transaction.description}</Text>
                           <Badge variant="flat" className="bg-gray-100 text-xs text-gray-600">
                              {transaction.category}
                           </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                           <span>{formatDate(transaction.date)}</span>
                           {transaction.customerName && (
                              <>
                                 <span>•</span>
                                 <span>Cliente: {transaction.customerName}</span>
                              </>
                           )}
                           {transaction.supplierName && (
                              <>
                                 <span>•</span>
                                 <span>Fornecedor: {transaction.supplierName}</span>
                              </>
                           )}
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="text-right">
                        <Text className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                           {transaction.type === 'income' ? '+' : '-'}
                           {formatCurrency(transaction.amount)}
                        </Text>
                        <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                     </div>
                     <PiCaretRight className="h-4 w-4 text-gray-400" />
                  </div>
               </div>
            ))}
         </div>

         {displayData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
               <PiClock className="h-12 w-12 text-gray-300" />
               <Text className="mt-2 text-gray-500">Nenhuma transação encontrada</Text>
            </div>
         )}

         {displayData.length > 5 && !showAll && (
            <div className="mt-4 text-center">
               <Button variant="outline" onClick={() => setShowAll(true)} className="w-full">
                  Ver mais {displayData.length - 5} transações
                  <PiCaretRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
         )}
      </WidgetCard>
   );
}
