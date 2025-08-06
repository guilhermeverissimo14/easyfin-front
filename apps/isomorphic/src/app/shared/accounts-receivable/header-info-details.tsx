'use client';
import { useEffect, useState } from 'react';
import { api } from '@/service/api';
import { LoadingSpinner } from '@/components/loading-spinner';
import { formatCurrency } from '@/utils/format';

interface AccountsReceivableTotals {
  totalReceived: number;
  receivedThisMonth: number; 
  receivedThisWeek: number;
  receivedToday: number;
  totalReceivable: number;
  totalDueReceivable: number;
}

interface HeaderInfoDetailsProps {
  refreshTrigger?: number; 
}

export const HeaderInfoDetails = ({ refreshTrigger }: HeaderInfoDetailsProps) => {
   const [totals, setTotals] = useState<AccountsReceivableTotals | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchTotals = async () => {
         try {
            setLoading(true);
            const { data } = await api.get<AccountsReceivableTotals>('/accounts-receivable/totals');
            setTotals(data);
            setError(null);
         } catch (err) {
            console.error('Erro ao buscar totais de contas a receber:', err);
            setError('Não foi possível carregar os totais');
         } finally {
            setLoading(false);
         }
      };

      fetchTotals();
   }, [refreshTrigger]);

   if (loading) {
      return (
         <div className="mx-auto mb-4 flex h-24 max-w-full items-center justify-center rounded-lg bg-[#3D8E7A] py-4 shadow-md">
            <LoadingSpinner />
         </div>
      );
   }

   if (error) {
      return (
         <div className="mx-auto mb-4 flex h-24 max-w-full items-center justify-center rounded-lg bg-[#3D8E7A] py-4 shadow-md">
            <p className="text-red-600">{error}</p>
         </div>
      );
   }

   return (
      <div className="mx-auto mb-4 flex max-w-full items-start rounded-lg bg-[#3D8E7A] py-4 shadow-md">
         <div className="grid w-full grid-cols-1 gap-4 px-4 md:grid-cols-5">
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">TOTAL A RECEBER</span>
               <div className="text-3xl font-semibold text-[#17345F]">
                  {totals ? formatCurrency(totals.totalReceivable) : 'R$ 0,00'} 
               </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">TOTAL VENCIDO A RECEBER</span>
               <div className="text-3xl font-semibold text-[#17345F]">
                  {totals ? formatCurrency(totals.totalDueReceivable || 0) : 'R$ 0,00'}
               </div> 
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">A RECEBER ESSE MÊS</span>
               <div className="text-3xl font-semibold text-[#17345F]">
                  {totals ? formatCurrency(totals.receivedThisMonth) : 'R$ 0,00'}
               </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">A RECEBER ESSA SEMANA</span>
               <div className="text-3xl font-semibold text-[#17345F]">
                  {totals ? formatCurrency(totals.receivedThisWeek) : 'R$ 0,00'}
               </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">A RECEBER HOJE</span>
               <div className="text-3xl font-semibold text-[#17345F]">
                  {totals ? formatCurrency(totals.receivedToday) : 'R$ 0,00'}
               </div>
            </div>
         </div>
      </div>
   );
};