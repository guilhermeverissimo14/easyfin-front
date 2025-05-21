'use client';

import { createColumnHelper } from '@tanstack/react-table';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { BankAccount } from '@/types';
import ModalForm from '@/components/modal/modal-form';
import { EditBankAccount } from './edit-bank-account';
import BankAccountDetails from './bank-account-details';

const columnHelper = createColumnHelper<BankAccount>();

// Map para converter o tipo da conta para texto legível
const accountTypeMap = {
  'C': 'Corrente',
  'S': 'Poupança'
};

export const ListBankAccountColumn = (getList: () => void) => {
  const { openModal } = useModal();
  const isMobile = window.innerWidth < 768;

  const columns = [
    columnHelper.accessor('bank', {
      id: 'bank',
      size: 180,
      header: 'Banco',
      cell: ({ row }) => <span className="font-medium">{row.original.bank}</span>,
    }),
    columnHelper.accessor('agency', {
      id: 'agency',
      size: 120,
      header: 'Agência',
      cell: ({ row }) => <span>{row.original.agency}</span>,
    }),
    columnHelper.accessor('account', {
      id: 'account',
      size: 150,
      header: 'Conta',
      cell: ({ row }) => <span>{row.original.account}</span>,
    }),
    columnHelper.accessor('type', {
      id: 'type',
      size: 120,
      header: 'Tipo',
      cell: ({ row }) => (
        <span>
          {row.original.type === 'C' ? 'Corrente' : 'Poupança'}
        </span>
      ),
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
                <ModalForm title="Detalhes da Conta Bancária">
                  <BankAccountDetails id={row.original.id} />
                </ModalForm>
              ),
              size: 'md',
            })
          }
          openModalEdit={() =>
            openModal({
              view: (
                <ModalForm title="Editar Conta Bancária">
                  <EditBankAccount id={row.original.id} getBankAccounts={getList} />
                </ModalForm>
              ),
              size: 'md',
            })
          }
          deletePopoverTitle="Excluir Conta Bancária"
          deletePopoverDescription={`Tem certeza que deseja excluir a conta ${row.original.account} do banco ${row.original.bank}?`}
          onDelete={async () => {
            await api.delete(`/bank-accounts/${row.original.id}`);
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