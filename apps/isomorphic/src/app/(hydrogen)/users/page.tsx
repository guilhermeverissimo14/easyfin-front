'use client';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import TableLayout from '../tables/table-layout';
import { ListUserColumn } from '../../shared/users/column';
import { useModal } from '@/app/shared/modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { FormUser } from '@/app/shared/users/form-user';
import { userType } from '@/types';
import TableComponent from '@/components/tables/table';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { PiPlusBold } from 'react-icons/pi';

export default function Users() {
   const [dataUser, setDataUser] = useState<userType[]>([]);
   const [loading, setLoading] = useState(false);

   const { openModal } = useModal();

   const getUsers = async () => {
      setLoading(true);
      try {
         const response = await apiCall(() => api.get<userType[]>('/users'));

         if (!response) {
            return;
         }

         response.data.sort((a, b) => {
            if (a.name < b.name) {
               return -1;
            }
            if (a.name > b.name) {
               return 1;
            }
            return 0;
         });

         setDataUser(response.data);
         setLoading(loading);
      } catch (error) {
         if ((error as any)?.response?.status === 401) {
            localStorage.clear();
            redirect('/signin');
         }
      }finally{
         setLoading(false);
      }
   };

   useEffect(() => {
      getUsers();
   }, []);

   const roleOptions = [
      { label: 'Administrador', value: 'admin' },
      { label: 'Usuário', value: 'user' },
   ];

 

   const pageHeader = {
      title: 'Usuários',
      breadcrumb: [
         {
            // href: routes.dashboard,
            name: 'Dashboard',
         },
         {
            name: 'Usuários',
         },
         {
            name: 'Listagem',
         },
      ],
   };

   return (
      <div className="mt-8">
         <TableLayout
            openModal={() =>
               openModal({
                  view: (
                     <ModalForm title="Cadastro de usuário">
                        <FormUser roleOptions={roleOptions} getUsers={getUsers} />
                     </ModalForm>
                  ),
                  customSize: '620px',
                  size: 'lg',
               })
            }
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={dataUser}
            fileName="usuarios"
            header=""
            action="Criar usuário"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <TableComponent
               title=""
               column={ListUserColumn(getUsers)}
               variant="classic"
               data={dataUser}
               tableHeader={true}
               searchAble={true}
               pagination={true}
               loading={loading}
            />
         </TableLayout>
      </div>
   );
}
