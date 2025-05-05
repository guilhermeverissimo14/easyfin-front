import { ContractsType } from '@/types';
import { createColumnHelper } from '@tanstack/react-table';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import ModalForm from '@/components/modal/modal-form';
import { useModal } from '../modal-views/use-modal';
import { EditContracts } from './edit-contracts';
import { ContractsDetails } from './contracts-details';

const columnHelper = createColumnHelper<ContractsType>();

export const ListContractsColumn = (getList: () => void) => {
    const { openModal } = useModal();

    const isMobile = window.innerWidth < 768;

    const columns = [
        columnHelper.accessor((row) => row.producer?.name, {
            id: 'producer',
            size: 160,
            header: 'Produtor',
        }),
        columnHelper.accessor('localManager', {
            id: 'localManager',
            size: 160,
            header: 'Gerente',
            cell: ({ row }) => <>{row.original.localManager?.name}</>,
        }),
        columnHelper.accessor('hectaresEstimate', {
            id: 'hectaresEstimate',
            size: 160,
            header: 'hectares estimados',
            cell: ({ row }) => <>{row.original.hectaresEstimate} </>,
        }),
        columnHelper.accessor('valuePerHectare', {
            id: 'valuePerHectare',
            size: 160,
            header: 'Valor por hectare',
            cell: ({ row }) => (
                <>
                    {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    }).format(row.original.valuePerHectare as number)}
                </>
            ),
        }),
        // columnHelper.accessor('paymentMethod', {
        //     id: 'paymentMethod',
        //     size: 160,
        //     header: 'Método pagamento',
        //     cell: ({ row }) => <>{row.original.paymentMethod} </>,
        // }),
        columnHelper.accessor('status', {
            id: 'status',
            size: 120,
            header: 'Status',
            cell: ({ row }) => (
                <>
                    {row.original.status === 'NAO_INICIADO' && (
                    <span className="bg-red-100 text-red-dark p-1 rounded-full">Não Iniciado</span>
                    )}
                    {row.original.status === 'EM_ANDAMENTO' && (
                    <span className="bg-orange-100 text-orange-dark p-1 rounded-full">Em Andamento</span>
                    )}
                    {row.original.status === 'FINALIZADO' && (
                    <span className="bg-green-100 text-green-dark p-1 rounded-full">Finalizado</span>
                    )}
                    {!['NAO_INICIADO', 'EM_ANDAMENTO', 'FINALIZADO'].includes(row.original.status as string) && (
                    <span className="bg-gray-100 text-gray-dark p-2 rounded-full">{row.original.status}</span>
                    )}
                </>
                ),
        }),
        columnHelper.display({
            id: 'actions',
            size: 0,
            header: '',
            cell: ({ row }) => (
                <TableRowActionGroup
                    isVisible={true}
                    isVisibleDelete={false}
                    isVisibleEdit={true}
                    openModalList={() =>
                        openModal({
                            view: (
                                <ModalForm width={true} title="Detalhes do contrato">
                                    <ContractsDetails  id={row.original.id as string} />
                                </ModalForm>
                            ),
                            size: 'lg',
                            customSize: '1024px',
                        })
                    }
                    openModalEdit={() =>
                        openModal({
                            view: (
                                <ModalForm title="Editar ">
                                    <EditContracts
                                        getList={getList}
                                        id={row.original.id as string}
                                    />
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
