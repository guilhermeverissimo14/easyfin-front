import { SpendingsType, userType } from '@/types';
import { createColumnHelper } from '@tanstack/react-table';
import { toast } from "react-toastify";
import { api } from '@/service/api';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import ModalForm from '@/components/modal/modal-form';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import { formatTableDate } from '@core/utils/format-date';
import { useModal } from '../../modal-views/use-modal';
import { EditSpending } from './edit-spending';
import { CommentsDetails } from '../../user-financial/comments-details';

const columnHelper = createColumnHelper<SpendingsType>();

export const ListSpendingsColumn = (getList: () => void) => {
   const { openModal } = useModal();

   const isMobile = window.innerWidth < 768;

   const user = JSON.parse(
      localStorage.getItem('eas:user') as string
   ) as userType;
   const isAdminOrManager = user.role === 'ADMIN' || user.role === 'MANAGER';

   const onDelete = async (userId: string) => {
      try {
         await api.delete(`spendings/${userId}`);
         getList();
         toast.success('Despesa excluída com sucesso!');
      } catch (error: any) {
         console.error('Erro ao excluir despesa:', error);
         toast.error(error.response.data.message || 'Erro ao excluir despesa');
      }
   };

   const columns = [
      columnHelper.accessor((row) => row.expense?.name, {
         id: 'expense',
         size: 240,
         header: 'Tipo de despesa',
      }),
      columnHelper.accessor('value', {
         id: 'value',
         size: 240,
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
         size: 240,
         header: 'Data',
         cell: ({ row }) => {
            return <>{formatTableDate(row.original.date as Date, 0)} </>;
         },
      }),
      columnHelper.accessor('approved', {
         id: 'approved',
         size: 240,
         header: 'Status',
         cell: ({ row }) => (
            <>
               {' '}
               {getStatusBadge(
                  row.original.approved ?? false,
                  row.original.approved ? 'Aprovado' : 'Pendente'
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
               onDelete={() => onDelete(row.original.id ? row.original.id : '')}
               deletePopoverTitle="Excluir despesa"
               deletePopoverDescription="Deseja excluir essa despesa?"
               isVisibleDelete={
                  !isAdminOrManager || row.original.approved ? false : true
               }
               isVisible={false}
               isVisibleEdit={
                  false
                  // !isAdminOrManager || row.original.approved ? false : true
               }
               isVisibleNote={(row.original.notes?.length ?? 0) > 0 && !row.original.approved}
               openModalEdit={() =>
                  openModal({
                     view: (
                        <ModalForm title="Editar despesa">
                           <EditSpending
                              getList={getList}
                              id={row.original.id as string}
                           />
                        </ModalForm>
                     ),
                     customSize: '900px',
                     size: 'lg',
                  })
               }
               openModalNote={() =>
                  openModal({
                     view: (
                        <ModalForm title="Observação">
                           <CommentsDetails id={row.original.id as string} />
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
