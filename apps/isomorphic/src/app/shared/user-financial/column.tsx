import { SpendingsType, userType } from '@/types';
import { createColumnHelper } from '@tanstack/react-table';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { api } from '@/service/api';
import ModalForm from '@/components/modal/modal-form';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import { formatTableDate } from '@core/utils/format-date';
import { useModal } from '../modal-views/use-modal';
import UpdateStatusPopover from '@/components/popover/popover-status';
import AddDescription from './add-description';
import ProofDetails from './proof-details';
import { CommentsDetails } from './comments-details';

const columnHelper = createColumnHelper<SpendingsType>();

export const ListFinancialColumn = (getList: () => void) => {

    const isMobile = window.innerWidth < 768;

    const handleUpdateStatus = async (userId: string | undefined, newStatus: boolean) => {
        await api.put(`/spendings/${userId}/approve`, { active: newStatus });
        getList();
    };

    const { openModal } = useModal();

    function convertRoles(role: string) {
        switch (role) {
           case 'ADMIN':
              return 'Administrador';
           case 'MANAGER':
              return 'Gerente';
           case 'LOCAL_MANAGER':
              return 'Gerente Local';
           case 'PILOT':
              return 'Piloto';
           case 'FINANCIAL':
              return 'Financeiro';
           default:
              return role;
        }
     }

    const columns = [

        columnHelper.accessor((row) => row.user?.name || '', {
            id: 'name',
            size: 160,
            header: 'Nome do usuário',
        }),

        columnHelper.accessor('user', {
            id: 'user',
            size: 100,
            header: 'Cargo',
            cell: ({ row }) => convertRoles(row.original.user?.role || '')
        }),

        columnHelper.accessor('expense', {
            id: 'expense',
            size: 160,
            header: 'Tipo de despesa',
            cell: ({ row }) => <>{row.original.expense?.name}</>
        }),

        columnHelper.accessor('value', {
            id: 'value',
            size: 100,
            header: 'Valor',
            cell: ({ row }) => (
                <>
                    {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    }).format(row.original.value as number)}
                </>
            ),
        }),

        columnHelper.accessor('date', {
            id: 'date',
            size: 100,
            header: 'Data',
            cell: ({ row }) => {
                return <>{formatTableDate(row.original.date as Date, 0)} </>;
            },
        }),

        columnHelper.accessor('description', {
            id: 'description',
            size: 120,
            header: 'Descrição',
            cell: ({ row }) => (row.original.description?.length || 0) > 30
                ? `${row.original.description?.substring(0, 30)}...`
                : row.original.description || ''
        }),
      
        columnHelper.accessor('approved', {
            id: 'approved',
            size: 120,
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex items-center">
                    <UpdateStatusPopover
                        title="Atualizar Status"
                        message={
                            row.original.approved
                                ? 'Deseja deixar essa despesa pedente?'
                                : 'Deseja aprovar essa despesa?'
                        }
                        onConfirm={() =>
                            handleUpdateStatus(row.original.id, !row.original.approved)
                        }
                    >
                        {getStatusBadge(row.original.approved ?? false, row.original.approved ? "Aprovar" : "Pendente")}
                    </UpdateStatusPopover>
                </div>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            size: 0,
            header: '',
            cell: ({ row }) => (
                <TableRowActionGroup
                    isVisibleImg={true}
                    isVisibleNote={true}
                    isVisibleDelete={false}
                    isVisible={(row.original.notes?.length ?? 0) > 0}
                    isVisibleEdit={false}
                    openModalList={() =>
                        openModal({
                            view: (
                                <ModalForm title="Observação">
                                   <CommentsDetails id={row.original.id as string} />
                                </ModalForm>
                            ),
                            size: 'lg',
                        })
                    }
                    openModalNote={() =>
                        openModal({
                            view: (
                                <ModalForm title="Adicionar comentário">
                                   <AddDescription id={row.original.id as string} getList={getList} />
                                </ModalForm>
                            ),
                            customSize: '900px',
                            size: 'lg',
                        })
                    }
                    openModalImage={() =>
                        openModal({
                            view: (
                                <ModalForm title="Comprovante">
                                   <ProofDetails imgUrl={typeof row.original.attachment === 'string' ? row.original.attachment : row.original.attachment?.url ?? ''}/>
                                </ModalForm>
                            ),
                            customSize: '900px',
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
