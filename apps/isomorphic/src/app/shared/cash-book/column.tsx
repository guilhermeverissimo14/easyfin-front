'use client';

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { ICashBook } from '@/types';
import { formatDate } from '@/utils/format';
import { useModal } from '../modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { LinkAccountModal } from './link-account-modal';
import { UpdateCostCenter } from './update-cost-center';
import { api } from '@/service/api';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { apiCall } from '@/helpers/apiHelper';

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

   const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

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
         size: 60,
         header: 'Tipo',
         cell: ({ row }) => <span>{row.original.type}</span>,
      }),
      columnHelper.accessor('description', {
         id: 'description',
         size: 160,
         header: 'Descrição',
         cell: ({ row }) => <span>{row.original.description}</span>,
      }),
      columnHelper.accessor('costCenter', {
         id: 'costCenter',
         size: 150,
         header: 'Centro de Custo',
         cell: ({ row }) => <span>{row.original.costCenter?.name || '-'}</span>,
      }),
      columnHelper.accessor('balance', {
         id: 'balance',
         size: 100,
         header: 'Saldo',
         cell: ({ row }) => <span>{row.original.balance}</span>,
         dataType: 'currency',
      }),
      columnHelper.accessor('documentNumber', {
         id: 'documentNumber',
         size: 120,
         header: 'Nº Documento',
         cell: ({ row }) => <span className="font-medium">{row.original.documentNumber || '-'}</span>,
      }),
      columnHelper.accessor(null, {
         id: 'actions',
         size: 50,
         header: 'Ações',
         cell: ({ row }) => (
            <>
            
               {userRole === 'ADMIN' && (
                  <TableRowActionGroup
                     isVisibleDelete={true}
                     isVisible={false}
                     isVisibleEdit={true}
                     isLink={true}
                     openModalLink={() =>
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
                        })
                     }
                     openModalEdit={() =>
                        openModal({
                           view: (
                              <ModalForm title="Editar Centro de Custo">
                                 <UpdateCostCenter
                                    cashFlowId={row.original.id}
                                    currentCostCenterId={row.original.costCenter?.id || ''}
                                    history={row.original.history}
                                    documentNumber={row.original.documentNumber}
                                    onSuccess={getList}
                                 />
                              </ModalForm>
                           ),
                           size: 'md',
                        })
                     }
                     deletePopoverTitle="Excluir Lançamento"
                     deletePopoverDescription={`Tem certeza que deseja excluir o lançamento "${row.original.history}"?`}
                     onDelete={async () => {
                        await apiCall(() => api.delete(`/cash-flow/${row.original.id}`));
                        getList();
                     }}
                  />
               )}
            </>
         ),
      }),
   ];

   return columns.filter((_, index) => {
      return isMobile ? index === 0 || index === columns.length - 1 : true;
   });
};
