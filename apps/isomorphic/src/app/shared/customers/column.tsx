'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import UpdateStatusPopover from '@/components/popover/popover-status';
import { useModal } from '@/app/shared/modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { api } from '@/service/api';
import { CustomerType } from '@/types';
import { EditCustomer } from './edit-customer';
import CustomerDetails from './customer-details';

const columnHelper = createColumnHelper<CustomerType>();

export const ListCustomerColumn = (getList: () => void) => {
  const { openModal } = useModal();
  const isMobile = window.innerWidth < 768;

  const handleUpdateStatus = async (customerId: string, newStatus: boolean) => {
    await api.patch(`/customers/${customerId}/toggle-status`, { active: newStatus });
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
            message={row.original.active ? 'Deseja desativar este cliente?' : 'Deseja reativar este cliente?'}
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
          isVisibleDelete={false}
          isVisible={true}
          isVisibleEdit={true}
          openModalList={() =>
            openModal({
              view: (
                <ModalForm title="Detalhes do cliente">
                  <CustomerDetails id={row.original.id} />
                </ModalForm>
              ),
              size: 'lg',
            })
          }
          openModalEdit={() =>
            openModal({
              view: (
                <ModalForm title="Editar cliente">
                  <EditCustomer getCustomers={getList} id={row.original.id} />
                </ModalForm>
              ),
              size: 'lg',
            })
          }
        />
      ),
    }),
  ];

  return columns.filter((_, index) => {
    return isMobile ? index === 0 || index === columns.length - 1 : true;
  });
};