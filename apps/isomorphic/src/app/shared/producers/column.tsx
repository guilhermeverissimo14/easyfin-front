import { toast } from "react-toastify";

import { createColumnHelper } from "@tanstack/react-table";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { ProducersType } from "@/types";
import { getStatusBadge } from "@core/components/table-utils/get-status-badge";
import TableRowActionGroup from "@core/components/table-utils/table-row-action-group";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "../modal-views/use-modal";
import { EditProducer } from "./edit-producer";
import DetailsProducer from "./details-producer";

const columnHelper = createColumnHelper<ProducersType>();

export const ListProducerColumn = (getList: () => void) => {


    const { openModal } = useModal();
    const isMobile = window.innerWidth < 768;

    const onDelete = async (userId: string) => {
        try {
            await apiCall(() => api.delete(`/expenses/${userId}`));
            getList();
            toast.success('Despesa excluída com sucesso!');
        } catch (error: any) {
            console.error('Erro ao excluir despesa:', error);
            toast.error(error.response.data.message || 'Erro ao excluir despesa');
        }
    }

    const columns = [
        columnHelper.accessor('name', {
            id: 'name',
            size: 240,
            header: 'Nome',
            cell: (info) => info.renderValue(),
        }),
        columnHelper.accessor('locations', {
            id: 'locations',
            size: 240,
            header: 'Cidade(s)',
            cell: ({ row }) => {
                const cities = row.original.locations.map((location) => location.city).join(', ');
                return cities.length > 20 ? `${cities.substring(0, 17)}...` : cities;
            },
        }),
        columnHelper.accessor('cpf', {
            id: 'cpf',
            size: 240,
            header: 'CPF',
            cell: ({ row }) => row.original.cpf,
        }),
        columnHelper.accessor('email', {
            id: 'email',
            size: 240,
            header: 'e-mail',
            cell: ({ row }) => row.original.email,
        }),
        columnHelper.accessor('phone', {
            id: 'phone',
            size: 240,
            header: 'Telefone',
            cell: ({ row }) => row.original.phone,
        }),
        columnHelper.display({
            id: 'active',
            size: 0,
            header: 'Status',
            cell: ({ row }) => (
                getStatusBadge(row.original.active ?? false, row.original.active ? "Ativo" : "Bloqueado")
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
                    onDelete={() => onDelete(row.original.id ? row.original.id : "")}
                    isVisibleDelete={false}
                    isVisible={true}
                    isVisibleEdit={true}
                    openModalList={() =>
                        openModal({
                            view: (
                                <ModalForm title="Detalhes do produtor">
                                    <DetailsProducer id={row.original.id} />
                                </ModalForm>
                            ),
                            size: 'lg',
                        })
                    }
                    openModalEdit={() =>
                        openModal({
                            view: (
                                <ModalForm title="Editar produtor" width={true}>
                                    <EditProducer getList={getList} id={row.original.id ? row.original.id : ""} />
                                </ModalForm>
                            ),
                            size: 'lg',
                            customSize: '1024px',
                        })
                    }
                />
            ),
        }),
    ]

    return columns.filter((_, index) => {
        return isMobile ? index === 0 || index === columns.length - 1 : true;
    });
}