'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { api } from '@/service/api';
import { IAccountsPayable } from '@/types';
import { formatDate, moneyMask } from '@/utils/format';
import { PiCashRegister } from 'react-icons/pi';
import { Tooltip } from 'rizzui/tooltip';
import { Button } from 'rizzui/button';
import { ActionIcon } from 'rizzui/action-icon';
import PencilIcon from '@core/components/icons/pencil';
import EyeIcon from '@core/components/icons/eye';

const columnHelper = createColumnHelper<IAccountsPayable>();

export const ListAccountsPayableColumn = (getList: () => void) => {
   const isMobile = window.innerWidth < 768;

   const columns = [
      columnHelper.accessor('documentNumber', {
         id: 'documentNumber',
         size: 120,
         header: 'N Docto',
         cell: ({ row }) => <span className="font-medium">{row.original.documentNumber}</span>,
      }),
      columnHelper.accessor('supplierName', {
         id: 'supplierName',
         size: 280,
         header: 'Fornecedor',
         cell: ({ row }) => <span>{row.original.supplierName}</span>,
      }),
      columnHelper.accessor('status', {
         id: 'status',
         size: 60,
         header: 'Status',
         cell: ({ row }) =>
            row.original.status === 'Pendente' ? (
               <div className="w-20">
                  <div className="border-1 cursor-pointer rounded-md border border-gray-500 px-2 py-1 text-center">Pendente</div>
               </div>
            ) : row.original.status === 'Atrasado' ? (
               <div className="w-20">
                  <div className="border-1 cursor-pointer rounded-md border border-red-400 bg-red-400 px-2 py-1 text-center text-white">Vencido</div>
               </div>
            ) : null,
      }),
      columnHelper.accessor('dueDate', {
         id: 'dueDate',
         size: 60,
         header: 'Datas',
         cell: ({ row }) => (
            <div className="flex flex-col">
               <span className="text-gray-600">{formatDate(row.original.launchDate)}</span>
               <span className="text-red-500">{formatDate(row.original.dueDate)}</span>
            </div>
         ),
      }),
      columnHelper.accessor('value', {
         id: 'value',
         size: 100,
         header: 'Valor',
         cell: ({ row }) => <span>{moneyMask(String(row.original.value))}</span>,
      }),
      columnHelper.display({
         id: 'actions',
         size: 60,
         cell: ({
            row,
            table: {
               options: { meta },
            },
         }) => (
            <div className="flex items-center justify-end">
               <div className="flex items-center">
                  <Tooltip size="sm" content="Liquidar" placement="top" color="invert">
                     <Button onClick={() => {}} as="span" className="cursor-pointer bg-white px-2 hover:bg-transparent">
                        <ActionIcon as="span" size="sm" variant="outline" aria-label="Liquidar">
                           <PiCashRegister size={24} className="text-gray-500 hover:text-gray-700" />
                        </ActionIcon>
                     </Button>
                  </Tooltip>

                  <Tooltip size="sm" content="Editar" placement="top" color="invert">
                     <Button onClick={() => {}} as="span" className="cursor-pointer bg-white px-2 hover:bg-transparent">
                        <ActionIcon as="span" size="sm" variant="outline" aria-label="Editar">
                           <PencilIcon className="size-4 text-gray-500 hover:text-gray-700" />
                        </ActionIcon>
                     </Button>
                  </Tooltip>

                  <Tooltip size="sm" content="Visualizar" placement="top" color="invert">
                     <Button onClick={() => {}} as="span" className="cursor-pointer bg-white px-2 hover:bg-transparent">
                        <ActionIcon as="span" size="sm" variant="outline" aria-label="Visualizar">
                           <EyeIcon className="size-4 text-gray-500 hover:text-gray-700" />
                        </ActionIcon>
                     </Button>
                  </Tooltip>
               </div>
            </div>
         ),
      }),
   ];

   return columns.filter((_, index) => {
      return isMobile ? index === 0 || index === columns.length - 1 : true;
   });
};
