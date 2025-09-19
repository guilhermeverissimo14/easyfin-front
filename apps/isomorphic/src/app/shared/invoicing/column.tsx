'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { api } from '@/service/api';
import { IInvoice } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { useModal } from '../modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { InvoiceDetails } from './invoice-details';
import { EditInvoice } from './edit-invoicing';

const columnHelper = createColumnHelper<IInvoice>();

export const ListInvoicingColumn = (getList: () => void) => {
   const { openModal } = useModal();
   const isMobile = window.innerWidth < 768;
   const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

   const columns = [
      columnHelper.accessor('invoiceNumber', {
         id: 'invoiceNumber',
         size: 120,
         header: 'Nota Fiscal',
         cell: ({ row }) => <span>{row.original.invoiceNumber}</span>,
      }),
      columnHelper.accessor('customer', {
         id: 'customer',
         size: 140,
         header: 'Cliente',
          cell: ({ row }) => (
            <span>
               {row.original.customer.name.length > 50
                  ? `${row.original.customer.name.substring(0, 40)}...`
                  : row.original.customer.name}
            </span>
         ),
      }),
      columnHelper.accessor('issueDate', {
         id: 'issueDate',
         size: 120,
         header: 'Emissão',
         cell: ({ row }) => <span className="font-medium">{formatDate(row.original.issueDate)}</span>,
      }),
      columnHelper.accessor('dueDate', {
         id: 'dueDate',
         size: 120,
         header: 'Vencimento',
         cell: ({ row }) => <span className="font-medium">{formatDate(row.original.dueDate)}</span>,
      }),
      columnHelper.accessor('paymentCondition', {
         id: 'paymentCondition.description',
         size: 160,
         header: 'Cond. Pagamento',
         cell: ({ row }) => <span>{row.original.paymentCondition.description}</span>,
      }),
      columnHelper.accessor('paymentCondition', {
         id: 'paymentCondition.condition',
         size: 120,
         header: 'Prazo (dias)',
         cell: ({ row }) => <span>{row.original.paymentCondition.condition}</span>,
      }),
      columnHelper.accessor('serviceValue', {
         id: 'serviceValue',
         size: 120,
         header: 'Valor do Serviço',
         cell: ({ row }) => <span>{formatCurrency(row.original.serviceValue)}</span>,
      }),
      columnHelper.display({
         id: 'actions',
         size: 140,
         cell: ({
            row,
            table: {
               options: { meta },
            },
         }) => (
            <TableRowActionGroup
               isVisibleDelete={!(userRole === 'USER')}
               isVisible={!(userRole === 'USER')}
               isVisibleEdit={!(userRole === 'USER')}
               openModalEdit={()=>{
                  openModal({
                     view: (
                        <ModalForm title="Editar Nota Fiscal">
                           <EditInvoice
                              getInvoices={getList}
                              invoiceId={row.original.id}
                              customerId={row.original.customer.id}
                           />
                        </ModalForm>
                     ),
                     size: 'lg',
                  });
               }}
               openModalList={() =>
                  openModal({
                     view: (
                        <ModalForm title="Detalhes da Nota Fiscal">
                           <InvoiceDetails id={row.original.id} />
                        </ModalForm>
                     ),
                     size: 'lg',
                  })
               }
               deletePopoverTitle="Excluir Nota Fiscal?"
               deletePopoverDescription={`Tem certeza que deseja excluir a Nota Fiscal ${row.original.invoiceNumber}?`}
               onDelete={async () => {
                  await api.delete(`/invoices/${row.original.id}`);
                  getList();
               }}
            />
         ),
      }),
   ];

   return columns.filter((_, index) => {
      return isMobile ? index === 0 || index === columns.length - 1 : true;
   });
};
