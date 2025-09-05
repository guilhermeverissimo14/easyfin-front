'use client';

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { ICashBook } from '@/types';
import { formatCurrency, formatDate, moneyMask } from '@/utils/format';
import { Button } from 'rizzui/button';
import { ActionIcon } from 'rizzui/action-icon';
import { Tooltip } from 'rizzui/tooltip';
import { PiLinkBold } from 'react-icons/pi';
import { useModal } from '../modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { LinkAccountModal } from './link-account-modal';

type CustomColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  dataType?: 'date' | 'currency' | string
}

const columnHelper = createColumnHelper<ICashBook>() as {
  accessor<TValue extends keyof ICashBook | null>(
    accessor: TValue,
    config: CustomColumnDef<ICashBook, TValue extends null ? unknown : ICashBook[TValue extends keyof ICashBook ? TValue : never]>
  ): CustomColumnDef<ICashBook, any>;
}

export const ListCashBookColumn = (getList: () => void) => {
   const isMobile = window.innerWidth < 768;
   const { openModal } = useModal();

   const columns = [
      columnHelper.accessor('date', {
         id: 'date',
         size: 120,
         header: 'Data',
         cell: ({ row }) => <span className="font-medium">{formatDate(row.original.date)}</span>,
         dataType: 'date',
      }),
      columnHelper.accessor('history', {
         id: 'history',
         size: 180,
         header: 'Histórico',
         cell: ({ row }) => <span>{row.original.history}</span>,
      }),
      columnHelper.accessor('value', {
         id: 'value',
         size: 100,
         header: 'Valor',
         cell: ({ row }) => <span>{row.original.value}</span>,
         dataType: 'currency', 
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
         cell: ({ row }) => <span>{row.original.costCenter as string}</span>,
      }),
      columnHelper.accessor('balance', {
         id: 'balance',
         size: 120,
         header: 'Saldo',
         cell: ({ row }) => <span>{row.original.balance}</span>,
         dataType: 'currency',
      }),
      columnHelper.accessor(null, {
         id: 'actions',
         size: 80,
         header: 'Ações',
         cell: ({ row }) => (
            <Tooltip size="sm" content="Vincular Conta" placement="top" color="invert">
               <Button
                  onClick={() => {
                     openModal({
                        view: (
                           <ModalForm title="Vincular Lançamento">
                              <LinkAccountModal 
                                 cashFlowId={row.original.id}
                                 transactionType={row.original.type}
                                 documentNumber={row.original.documentNumber}
                                 history={row.original.history}
                                 value={row.original.value}
                                 onSuccess={getList}
                              />
                           </ModalForm>
                        ),
                        size: 'lg',
                     });
                  }}
                  as="span"
                  className="cursor-pointer bg-white px-2 hover:bg-transparent"
               >
                  <ActionIcon as="span" size="sm" variant="outline" aria-label="Vincular">
                     <PiLinkBold size={16} className="text-gray-500 hover:text-gray-700" />
                  </ActionIcon>
               </Button>
            </Tooltip>
         ),
      }),
   ];

   return columns.filter((_, index) => {
      return isMobile ? index === 0 || index === columns.length - 1 : true;
   });
};
