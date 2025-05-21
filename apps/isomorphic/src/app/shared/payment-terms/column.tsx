'use client';

import { createColumnHelper } from '@tanstack/react-table';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { PaymentTermModel } from '@/types';
import ModalForm from '@/components/modal/modal-form';
import PaymentTermsDetails from './payment-terms-details';
import { EditPaymentTerm} from './edit-payment-terms';

const columnHelper = createColumnHelper<PaymentTermModel>();

export const ListPaymentTermColumn = (getList: () => void) => {
  const { openModal } = useModal();
  const isMobile = window.innerWidth < 768;

  const columns = [
    columnHelper.accessor('description', {
      id: 'description',
      size: 200,
      header: 'Descrição',
      cell: ({ row }) => <span className="font-medium">{row.original.description}</span>,
    }),
    columnHelper.accessor('term', {
      id: 'term',
      size: 120,
      header: 'Prazo (dias)',
      cell: ({ row }) => <span>{row.original.term}</span>,
    }),
    columnHelper.accessor('tax', {
      id: 'tax',
      size: 120,
      header: 'Taxa (%)',
      cell: ({ row }) => <span>{row.original.tax ? `${row.original.tax}%` : '0%'}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      size: 120,
      cell: ({
        row,
        table: {
          options: { meta },
        },
      }) => (
        <TableRowActionGroup
          isVisibleDelete={true}
          isVisible={true}
          isVisibleEdit={true}
          openModalList={() =>
            openModal({
              view: (
                <ModalForm title="Detalhes da Condição de Pagamento">
                  <PaymentTermsDetails id={row.original.id} />
                </ModalForm>
              ),
              size: 'md',
            })
          }
          openModalEdit={() =>
            openModal({
              view: (
                <ModalForm title="Editar Condição de Pagamento">
                  <EditPaymentTerm id={row.original.id} getPaymentTerms={getList} />
                </ModalForm>
              ),
              size: 'md',
            })
          }
          deletePopoverTitle="Excluir Condição de Pagamento"
          deletePopoverDescription={`Tem certeza que deseja excluir a condição "${row.original.description}"?`}
          onDelete={async () => {
            await api.delete(`/payment-terms/${row.original.id}`);
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