'use client';

import { createColumnHelper } from '@tanstack/react-table';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { constCentersModel } from '@/types';
import ModalForm from '@/components/modal/modal-form';
import CostCenterDetails from './cost-center-details';
import { EditCostCenter } from './edit-cost-center';

const columnHelper = createColumnHelper<constCentersModel>();

export const ListCostCenterColumn = (getList: () => void) => {
  const { openModal } = useModal();
  const isMobile = window.innerWidth < 768;

  const columns = [
    columnHelper.accessor('name', {
      id: 'name',
      size: 250,
      header: 'Nome',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
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
                <ModalForm title="Detalhes do Centro de Custo">
                  <CostCenterDetails id={row.original.id} />
                </ModalForm>
              ),
              size: 'md',
            })
          }
          openModalEdit={() =>
            openModal({
              view: (
                <ModalForm title="Editar Centro de Custo">
                  <EditCostCenter id={row.original.id} getCostCenters={getList} />
                </ModalForm>
              ),
              size: 'md',
            })
          }
          deletePopoverTitle="Excluir Centro de Custo"
          deletePopoverDescription={`Tem certeza que deseja excluir o centro de custo "${row.original.name}"?`}
          onDelete={async () => {
            await api.delete(`/cost-centers/${row.original.id}`);
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