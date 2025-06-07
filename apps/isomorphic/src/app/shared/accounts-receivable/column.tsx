'use client';

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { api } from '@/service/api';
import { IAccountsReceivable } from '@/types';
import { formatCurrency, formatDate, moneyMask } from '@/utils/format';
import { GiTakeMyMoney } from 'react-icons/gi';
import { Tooltip } from 'rizzui/tooltip';
import { Button } from 'rizzui/button';
import { ActionIcon } from 'rizzui/action-icon';
import PencilIcon from '@core/components/icons/pencil';
import EyeIcon from '@core/components/icons/eye';
import { useModal } from '../modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { SettleAccountReceivable } from './settle-account-receivable';
import { AccountReceivableDetails } from './account-receivable-details';
import { EditAccountReceivable } from './edit-account-receivable';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';

type CustomColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
   dataType?: 'date' | 'currency' | string
}

const columnHelper = createColumnHelper<IAccountsReceivable>() as {
   accessor<TValue extends keyof IAccountsReceivable | null>(
      accessor: TValue,
      config: CustomColumnDef<IAccountsReceivable, TValue extends null ? unknown : IAccountsReceivable[TValue extends keyof IAccountsReceivable ? TValue : never]>
   ): CustomColumnDef<IAccountsReceivable, any>;
   display(config: CustomColumnDef<IAccountsReceivable, any>): CustomColumnDef<IAccountsReceivable, any>;
}

export const ListAccountsReceivableColumn = (getList: () => void) => {
   const { openModal } = useModal();
   const isMobile = window.innerWidth < 768;

   const columns = [
      columnHelper.accessor('documentNumber', {
         id: 'documentNumber',
         size: 120,
         header: 'N Docto',
         cell: ({ row }) => <span className="font-medium">{row.original.documentNumber}</span>,
      }),
      columnHelper.accessor('customerName', {
         id: 'customerName',
         size: 280,
         header: 'Cliente',
         cell: ({ row }) => <span>{row.original.customerName}</span>,
      }),
       columnHelper.accessor('status', {
         id: 'status',
         size: 60,
         header: 'Status',
         cell: ({ row }) => {
            const status = row.original.status;

            if (status === "PENDING") {
               return (
                  <div className="w-20">
                     <div className="border-1 cursor-pointer rounded-md border border-[#ABD2EF] bg-[#ABD2EF] px-2 py-1 text-center text-white">
                        Aberto
                     </div>
                  </div>
               );
            } else if (status === "OVERDUE") {
               return (
                  <div className="w-20">
                     <div className="border-1 cursor-pointer rounded-md border border-red-400 bg-red-400 px-2 py-1 text-center text-white">
                        Vencido
                     </div>
                  </div>
               );
            } else if (status === "PAID") {
               return (
                  <div className="w-22">
                     <div className="border-1 cursor-pointer rounded-md border border-green-400 bg-green-400 px-2 py-1 text-center text-white">
                        Pago
                     </div>
                  </div>
               );
            } else if (status === "CANCELED") {
               return (
                  <div className="w-22">
                     <div className="border-1 cursor-pointer rounded-md border border-gray-400 bg-gray-400 px-2 py-1 text-center text-white">
                        Cancelado
                     </div>
                  </div>
               );
            }

            return status;
         },
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
         dataType: 'date',
      }),
      columnHelper.accessor('value', {
         id: 'value',
         size: 100,
         header: 'Valor',
         cell: ({ row }) => <span>{formatCurrency(row.original.value)}</span>,
         dataType: 'currency',
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
                  <Tooltip size="sm" content="Receber" placement="top" color="invert">
                     <Button
                        onClick={() => {
                           openModal({
                              view: (
                                 <ModalForm title="Receber">
                                    <SettleAccountReceivable getAccounts={getList} account={row.original} />
                                 </ModalForm>
                              ),
                              size: 'sm',
                              customSize: 'max-w-2xl',
                           });
                        }}
                        as="span"
                        className="cursor-pointer bg-white px-2 hover:bg-transparent"
                     >
                        <ActionIcon as="span" size="sm" variant="outline" aria-label="Liquidar">
                           <GiTakeMyMoney size={24} className="text-gray-500 hover:text-gray-700" />
                        </ActionIcon>
                     </Button>
                  </Tooltip>

                  <Tooltip size="sm" content="Editar" placement="top" color="invert">
                     <Button
                        onClick={() => {
                           openModal({
                              view: (
                                 <ModalForm title="Editar documento">
                                    <EditAccountReceivable getAccounts={getList} account={row.original} />
                                 </ModalForm>
                              ),
                              size: 'sm',
                           });
                        }}
                        as="span"
                        className="cursor-pointer bg-white px-2 hover:bg-transparent"
                     >
                        <ActionIcon as="span" size="sm" variant="outline" aria-label="Editar">
                           <PencilIcon className="size-4 text-gray-500 hover:text-gray-700" />
                        </ActionIcon>
                     </Button>
                  </Tooltip>

                  <Tooltip size="sm" content="Visualizar" placement="top" color="invert">
                     <Button
                        onClick={() => {
                           openModal({
                              view: (
                                 <ModalForm title="Informações do documento">
                                    <AccountReceivableDetails id={row.original.id as any} />
                                 </ModalForm>
                              ),
                              size: 'sm',
                           });
                        }}
                        as="span"
                        className="cursor-pointer bg-white px-2 hover:bg-transparent"
                     >
                        <ActionIcon as="span" size="sm" variant="outline" aria-label="Visualizar">
                           <EyeIcon className="size-4 text-gray-500 hover:text-gray-700" />
                        </ActionIcon>
                     </Button>
                  </Tooltip>

                  <Tooltip size="sm" content="Remover" placement="top" color="invert">
                     <TableRowActionGroup
                        isVisibleDelete={true}
                        isVisibleEdit={false}
                        isVisible={false}
                        deletePopoverTitle="Excluir conta a receber?"
                        deletePopoverDescription={`Tem certeza que deseja excluir o Documento ${row.original.documentNumber}?`}
                        onDelete={async () => {
                           await api.delete(`/accounts-receivable/${row.original.id}`);
                           getList();
                        }}
                     />
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
