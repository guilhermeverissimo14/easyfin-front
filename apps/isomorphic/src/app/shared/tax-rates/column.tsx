'use client';

import { createColumnHelper } from '@tanstack/react-table';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { TaxRateModel } from '@/types';
import ModalForm from '@/components/modal/modal-form';
import { EditTaxRate } from './edit-tax-rate';
import TaxRateDetails from './tax-rate-details';

const columnHelper = createColumnHelper<TaxRateModel>();

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const ListTaxRateColumn = (getList: () => void) => {
  const { openModal } = useModal();
  const isMobile = window.innerWidth < 768;

  const columns = [
    columnHelper.accessor('year', {
      id: 'year',
      size: 100,
      header: 'Ano',
      cell: ({ row }) => <span>{row.original.year}</span>,
    }),
    columnHelper.accessor('month', {
      id: 'month',
      size: 120,
      header: 'Mês',
      cell: ({ row }) => <span>{monthNames[row.original.month - 1] || '-'}</span>,
    }),
    columnHelper.accessor('issqnTaxRate', {
      id: 'issqnTaxRate',
      size: 150,
      header: 'Alíquota ISSQN',
      cell: ({ row }) => <span>{row.original.issqnTaxRate}%</span>,
    }),
    columnHelper.accessor('effectiveTaxRate', {
      id: 'effectiveTaxRate',
      size: 180,
      header: 'Alíquota Efetiva',
      cell: ({ row }) => <span>{row.original.effectiveTaxRate}%</span>,
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
                <ModalForm title="Detalhes da Alíquota">
                  <TaxRateDetails id={row.original.id} />
                </ModalForm>
              ),
              size: 'md',
            })
          }
          openModalEdit={() =>
            openModal({
              view: (
                <ModalForm title="Editar Alíquota">
                  <EditTaxRate id={row.original.id} getTaxRates={getList} />
                </ModalForm>
              ),
              size: 'md',
            })
          }
          deletePopoverTitle='Excluir Alíquota'
          deletePopoverDescription='Você tem certeza que deseja excluir essa alíquota?'
          onDelete={async () => {
            await api.delete(`/tax-rates/${row.original.id}`);
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