'use client';

import { useState } from 'react';
import { DatePicker } from '@core/ui/datepicker';
import { ptBR } from 'date-fns/locale';
import { format, subDays } from 'date-fns';
import TopCustomers from './top-customers';
import TopSuppliers from './top-suppliers';

export default function DashboardAnalytics() {
   const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 30));
   const [endDate, setEndDate] = useState<Date | null>(new Date());

   const buildApiUrl = (baseUrl: string) => {
      const params = new URLSearchParams();
      if (startDate) {
         params.append('startDate', format(startDate, 'yyyy-MM-dd'));
      }
      if (endDate) {
         params.append('endDate', format(endDate, 'yyyy-MM-dd'));
      }
      return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
   };

   return (
      <div className="space-y-6">
         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
               <h2 className="text-xl font-bold text-gray-800">Visão Analítica</h2>
               <p className="text-sm text-gray-600 mt-1">
                  Análise detalhada dos principais clientes e fornecedores por período
               </p>
            </div>
            
            <div className="flex items-center gap-2 md:flex-row flex-col bg-gray-50 p-3 rounded-lg border">
               <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Período:</span>
               <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  placeholderText="Data inicial"
                  dateFormat="dd/MM/yyyy"
                  locale={ptBR}
                  className="w-48 text-xs"
                  inputProps={{
                        variant: 'outline',
                        inputClassName: 'h-9 px-2 text-sm [&_input]:text-ellipsis',
                        className: 'w-48'
                     }}
               />
               <span className="text-gray-400">até</span>
               <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  placeholderText="Data final"
                  dateFormat="dd/MM/yyyy"
                  locale={ptBR}
                  className="w-48 text-xs"
                  inputProps={{
                        variant: 'outline',
                        inputClassName: 'h-9 px-2 text-sm [&_input]:text-ellipsis',
                        className: 'w-48'
                     }}
               />
               {(startDate || endDate) && (
                  <button
                     onClick={() => {
                        setStartDate(null);
                        setEndDate(null);
                     }}
                     className="text-xs text-gray-500 hover:text-gray-700 underline whitespace-nowrap"
                  >
                     Limpar
                  </button>
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2">
            <TopCustomers 
               startDate={startDate} 
               endDate={endDate}
               apiUrl={buildApiUrl('/dashboard/top-customers')}
            />
            <TopSuppliers 
               startDate={startDate} 
               endDate={endDate}
               apiUrl={buildApiUrl('/dashboard/top-suppliers')}
            />
         </div>
      </div>
   );
}