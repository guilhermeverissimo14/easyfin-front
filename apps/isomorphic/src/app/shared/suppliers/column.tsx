'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import UpdateStatusPopover from '@/components/popover/popover-status';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { SupplierType } from '@/types';
import ModalForm from '@/components/modal/modal-form';
import { EditSupplier } from './edit-supplier';
import SupplierDetails from './supplier-details';

const columnHelper = createColumnHelper<SupplierType>();

export const ListSupplierColumn = (getList: () => void) => {
  const { openModal } = useModal();
  const isMobile = window.innerWidth < 768;

  const handleUpdateStatus = async (supplierId: string, newStatus: boolean) => {
    await api.patch(`/suppliers/${supplierId}/toggle-status`, { active: newStatus });
    getList();
  };

  const columns = [
    columnHelper.accessor('name', {
      id: 'name',
      size: 150,
      header: 'Nome',
      cell: ({ row }) => <span>{row.original.name}</span>,
    }),
    columnHelper.accessor('cnpj', {
      id: 'cnpj',
      size: 150,
      header: 'CNPJ',
      cell: (info) => info.renderValue(),
    }),
    columnHelper.accessor('email', {
      id: 'email',
      size: 200,
      header: 'E-mail',
      cell: ({ row }) => <span>{row.original.email || '-'}</span>,
    }),
    columnHelper.accessor('phone', {
      id: 'phone',
      size: 200,
      header: 'Telefone',
      cell: ({ row }) => <span>{row.original.phone || '-'}</span>,
    }),
    columnHelper.accessor('city', {
      id: 'city',
      size: 120,
      header: 'Cidade',
      cell: ({ row }) => <span>{row.original.city || '-'}</span>,
    }),
    columnHelper.accessor('contact', {
      id: 'contact',
      size: 150,
      header: 'Contato',
      cell: ({ row }) => <span>{row.original.contact || '-'}</span>,
    }),
    columnHelper.accessor('retIss', {
      id: 'retIss',
      size: 100,
      header: 'Ret. ISS',
      cell: ({ row }) => <span>{row.original.retIss ? 'Sim' : 'Não'}</span>,
    }),
    columnHelper.display({
      id: 'active',
      size: 80,
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center">
          <UpdateStatusPopover
            title="Atualizar Status"
            message={row.original.active ? 'Deseja desativar este fornecedor?' : 'Deseja reativar este fornecedor?'}
            onConfirm={() => handleUpdateStatus(row.original.id, !row.original.active)}
          >
            {getStatusBadge(row.original.active, row.original.active ? 'Ativo' : 'Inativo')}
          </UpdateStatusPopover>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      size: 160,
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
                <ModalForm title="Detalhes do fornecedor">
                    <SupplierDetails id={row.original.id} />
                </ModalForm>
              ),
              size: 'lg',
            })
          }
          openModalEdit={() =>
            openModal({
              view: (
                <ModalForm title="Editar fornecedor">
                    <EditSupplier getSuppliers={getList} id={row.original.id} />
                </ModalForm>
              ),
              size: 'lg',
            })
          }
          deletePopoverTitle="Excluir Fornecedor"
          deletePopoverDescription={`Tem certeza que deseja excluir o fornecedor "${row.original.name}"?`}
          onDelete={async () => {
            await api.delete(`/suppliers/${row.original.id}`);
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