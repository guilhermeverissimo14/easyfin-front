'use client';

import AvatarCard from '@core/ui/avatar-card';
import { createColumnHelper } from '@tanstack/react-table';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import UpdateStatusPopover from '@/components/popover/popover-status';
import { useModal } from '@/app/shared/modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { UserDetails } from '@/app/shared/users/user-details';
import { FormEdit } from '@/app/shared/users/form-edit';
import { userType } from '@/types';
import { api } from '@/service/api';

const columnHelper = createColumnHelper<userType>();

function convertRoles(role: string) {
   switch (role) {
      case 'ADMIN':
         return 'Administrador';
      case 'USER':
         return 'Usuário';
    
   }
}

export const ListUserColumn = (getList: () => void) => {
   const { openModal } = useModal();
   const isMobile = window.innerWidth < 768;

   const handleUpdateStatus = async (userId: string, newStatus: boolean) => {
      await api.patch(`/users/${userId}/toggle-status`, { active: newStatus });
      getList();
   };

   const columns = [
      columnHelper.accessor('name', {
         id: 'name',
         size: 240,
         header: 'Nome',
         cell: ({ row }) => <span>{row.original.name}</span>,
      }),
      columnHelper.accessor('role', {
         id: 'role',
         size: 240,
         header: 'Cargo',
         cell: ({ row }) => <span>{convertRoles(row.original.role)}</span>,
      }),
      columnHelper.accessor('email', {
         id: 'email',
         size: 240,
         header: 'E-mail',
         cell: (info) => info.renderValue()?.toLowerCase(),
      }),
      columnHelper.accessor('phone', {
         id: 'phone',
         size: 120,
         header: 'Telefone',
         cell: ({ row }) => <>{row.original.phone}</>,
      }),
      
      columnHelper.display({
         id: 'active',
         size: 80,
         header: 'Status',
         cell: ({ row }) => (
            <div className="flex items-center">
               <UpdateStatusPopover
                  title="Atualizar Status"
                  message={row.original.active ? 'Deseja bloquear o usuário?' : 'Deseja reativar este usuário?'}
                  onConfirm={() => handleUpdateStatus(row.original.id, !row.original.active)}
               >
                  {getStatusBadge(row.original.active ?? false, row.original.active ? 'Ativo' : 'Bloqueado')}
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
                        <ModalForm title="Detalhes do usuário">
                           <UserDetails id={row.original.id} />
                        </ModalForm>
                     ),
                     size: 'lg',
                  })
               }
               openModalEdit={() =>
                  openModal({
                     view: (
                        <ModalForm title="Editar usuário">
                           <FormEdit getUsers={getList} id={row.original.id} />
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
