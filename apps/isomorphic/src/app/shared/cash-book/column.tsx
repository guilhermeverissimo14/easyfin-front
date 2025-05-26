'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { api } from '@/service/api';
import { ICashBook } from '@/types';
import { formatDate, moneyMask } from '@/utils/format';

const columnHelper = createColumnHelper<ICashBook>();

export const ListCashBookColumn = (getList: () => void) => {
   const isMobile = window.innerWidth < 768;

   const columns = [
      columnHelper.accessor('date', {
         id: 'date',
         size: 120,
         header: 'Data',
         cell: ({ row }) => <span className="font-medium">{formatDate(row.original.date)}</span>,
      }),
      columnHelper.accessor('historic', {
         id: 'historic',
         size: 180,
         header: 'Histórico',
         cell: ({ row }) => <span>{row.original.historic}</span>,
      }),
      columnHelper.accessor('value', {
         id: 'value',
         size: 100,
         header: 'Valor',
         cell: ({ row }) => <span>{moneyMask(String(row.original.value))}</span>,
      }),
      columnHelper.accessor('type', {
         id: 'type',
         size: 40,
         header: 'Tipo',
         cell: ({ row }) => <span>{row.original.type}</span>,
      }),
      columnHelper.accessor('description', {
         id: 'description',
         size: 180,
         header: 'Descrição',
         cell: ({ row }) => <span>{row.original.description}</span>,
      }),
      columnHelper.accessor('costCenter', {
         id: 'costCenter',
         size: 120,
         header: 'Centro de Custo',
         cell: ({ row }) => <span>{row.original.costCenter}</span>,
      }),
      columnHelper.accessor('balance', {
         id: 'balance',
         size: 120,
         header: 'Saldo',
         cell: ({ row }) => <span>{moneyMask(String(row.original.balance))}</span>,
      }),
   ];

   return columns.filter((_, index) => {
      return isMobile ? index === 0 || index === columns.length - 1 : true;
   });
};
