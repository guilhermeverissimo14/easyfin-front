import { toast } from "react-toastify";

import UpdateStatusPopover from "@/components/popover/popover-status";
import { createColumnHelper } from "@tanstack/react-table";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { Expenses} from "@/types";
import { getStatusBadge } from "@core/components/table-utils/get-status-badge";
import TableRowActionGroup from "@core/components/table-utils/table-row-action-group";
import { useModal } from "../../modal-views/use-modal";
import ModalForm from "@/components/modal/modal-form";
import { EditExpenses } from "./edit-exepense";

const columnHelper = createColumnHelper<Expenses>();

export const ListExpenditureColumn = (getList: () => void) => {

   
   const { openModal } = useModal();
   const isMobile = window.innerWidth < 768;

   const handleUpdateStatus = async (userId: string, newStatus: boolean) => {
      await apiCall(() => api.patch(`/expenses/${userId}/toggle-status`, { active: newStatus }));
      getList();
   };

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
      columnHelper.display({
         id: 'active',
         size: 0,
         header: 'Status',
         cell: ({ row }) => (
            <UpdateStatusPopover
               title="Atualizar Status"
               message={
                  row.original.active
                     ? 'Deseja desativar essa despesa?'
                     : 'Deseja reativar esta despesa?'
               }
               onConfirm={() =>
                  handleUpdateStatus(row.original.id ? row.original.id : "", !row.original.active)
               }
            >
               {getStatusBadge(row.original.active ?? false, row.original.active ? "Ativo" : "Bloqueado")}
            </UpdateStatusPopover>
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
               deletePopoverTitle="Excluir despesa"
               deletePopoverDescription="Deseja excluir essa despesa?"
               isVisibleDelete={true}
               isVisible={false}
               isVisibleEdit={true}
               openModalEdit={() =>
                  openModal({
                     view: (
                        <ModalForm title="Editar despesa">
                           <EditExpenses getExpenses={getList} id={row.original.id ? row.original.id : ""} />
                        </ModalForm>
                     ),
                     customSize: '900px',
                     size: 'lg',
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