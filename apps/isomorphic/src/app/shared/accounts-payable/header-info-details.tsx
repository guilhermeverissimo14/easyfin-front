'use client';
import { useEffect, useState } from 'react';
import { api } from '@/service/api';
import { LoadingSpinner } from '@/components/loading-spinner';
import { formatCurrency } from '@/utils/format';

interface AccountsPayableTotals {
  totalOverdue: number;
  overdueThisMonth: number; 
  overdueThisWeek: number;
  overdueToday: number;
  totalPayable: number;
}

export const HeaderInfoDetails = () => {
   const [totals, setTotals] = useState<AccountsPayableTotals | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);


   useEffect(() => {
      const fetchTotals = async () => {
         try {
            setLoading(true);
            const { data } = await api.get<AccountsPayableTotals>('/accounts-payable/totals');
            setTotals(data);
            setError(null);
         } catch (err) {
            console.error('Erro ao buscar totais de contas a pagar:', err);
            setError('Não foi possível carregar os totais');
         } finally {
            setLoading(false);
         }
      };

      fetchTotals();
   }, []);

   if (loading) {
      return (
         <div className="mx-auto mb-4 flex h-24 max-w-full items-center justify-center rounded-lg bg-[#CEBDA3] py-4 shadow-md">
            <LoadingSpinner />
         </div>
      );
   }

   if (error) {
      return (
         <div className="mx-auto mb-4 flex h-24 max-w-full items-center justify-center rounded-lg bg-[#CEBDA3] py-4 shadow-md">
            <p className="text-red-600">{error}</p>
         </div>
      );
   }

   return (
      <div className="mx-auto mb-4 flex max-w-full items-start rounded-lg bg-[#CEBDA3] py-4 shadow-md">
         <div className="grid w-full grid-cols-1 gap-4 px-4 md:grid-cols-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">TOTAL A PAGAR</span>
               <div className="text-3xl font-semibold text-[#17345F]">
                  {totals ? formatCurrency(totals.totalPayable) : 'R$ 0,00'}
               </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">A VENCER ESSE MÊS</span>
               <div className="text-3xl font-semibold text-[#17345F]">
                  {totals ? formatCurrency(totals.overdueThisMonth) : 'R$ 0,00'}
               </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">A VENCER ESSA SEMANA</span>
               <div className="text-3xl font-semibold text-[#17345F]">
                  {totals ? formatCurrency(totals.overdueThisWeek) : 'R$ 0,00'}
               </div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 p-3">
               <span className="mb-2 text-sm text-gray-600">VENCENDO HOJE</span>
               <div className="text-3xl font-semibold text-[#17345F]">
                  {totals ? formatCurrency(totals.overdueToday) : 'R$ 0,00'}
               </div>
            </div>
         </div>
      </div>
   );
};