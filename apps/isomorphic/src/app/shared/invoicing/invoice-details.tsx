'use client';

import React, { useEffect, useState } from 'react';
import { IInvoice } from '@/types';
import { api } from '@/service/api';
import { LoadingSpinner } from '@/components/loading-spinner';
import { formatDate, formatCurrency } from '@/utils/format';

interface InvoiceDetailsProps {
   id: string;
}

export const InvoiceDetails = ({ id }: InvoiceDetailsProps) => {
   const [loading, setLoading] = useState(true);
   const [invoice, setInvoice] = useState<IInvoice | null>(null);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchInvoiceDetails = async () => {
         try {
            setLoading(true);
            const response = await api.get(`/invoices/${id}`);

            if (!response) {
               throw new Error(`Error fetching invoice details: ${response}`);
            }

            const data = await response.data;
            setInvoice(data as IInvoice);
         } catch (err) {
            console.error('Error fetching invoice details:', err);
            setError('Falha ao carregar os detalhes da nota fiscal');
         } finally {
            setLoading(false);
         }
      };

      fetchInvoiceDetails();
   }, [id]);

   if (loading) {
      return (
         <div className="flex h-full w-full items-center justify-center p-10">
            <LoadingSpinner />
         </div>
      );
   }

   if (error && !invoice) {
      return <div className="p-4 text-red-500">{error}</div>;
   }

   if (!invoice) {
      return <div className="p-4 text-gray-500">Nota fiscal não encontrada</div>;
   }

   const customerName = invoice.customer?.name;
   const costCenterName = invoice.costCenter?.name;
   const paymentCondition = invoice.paymentCondition?.condition;
   const paymentConditionDescription = invoice.paymentCondition?.description;

   return (
      <div>
         <div className="flex flex-row items-center justify-between pb-4 md:col-span-3">
            <div className="flex items-center">
               <p className="text-lg font-semibold">{customerName}</p>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Número da Nota Fiscal</span>
                  <span className="p-1">{invoice.invoiceNumber}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Data de Emissão</span>
                  <span className="p-1">{formatDate(invoice.issueDate)}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Data de Vencimento</span>
                  <span className="p-1">{formatDate(invoice.dueDate)}</span>
               </p>
            </div>

            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Condição de Pagamento</span>
                  <span className="p-1">{paymentConditionDescription}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Prazo Pagamento</span>
                  <span className="p-1">{paymentCondition} dias</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Centro de Custo</span>
                  <span className="p-1">{costCenterName || 'Não especificado'}</span>
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
                  <span className="bg-gray-100 p-1 font-semibold">Valor do Serviço</span>
                  <span className="p-1">{formatCurrency(invoice.serviceValue)}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Valor ISSQN</span>
                  <span className="p-1">{formatCurrency(invoice.issqnValue) || 0}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Alíquota ISSQN</span>
                  <span className="p-1">{invoice.issqnTaxRate}%</span>
               </p>
            </div>

            <div>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Alíquota Efetiva</span>
                  <span className="p-1">{invoice?.effectiveTaxRate?.toFixed(2) || 0}%</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Imposto Efetivo</span>
                  <span className="p-1">{formatCurrency(invoice.effectiveTax)}</span>
               </p>
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Valor Líquido</span>
                  <span className="p-1 font-semibold">{formatCurrency(invoice.netValue)}</span>
               </p>
            </div>
         </div>

         {invoice.notes && (
            <div className="mt-4">
               <p className="flex flex-col text-sm text-gray-500">
                  <span className="bg-gray-100 p-1 font-semibold">Observações</span>
                  <span className="p-1">{invoice.notes}</span>
               </p>
            </div>
         )}
      </div>
   );
};
