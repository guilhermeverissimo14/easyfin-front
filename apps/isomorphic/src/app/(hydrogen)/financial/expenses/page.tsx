'use client';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

import TableComponent from '@/components/tables/table';
import ModalForm from '@/components/modal/modal-form';
import { routes } from '@/config/routes';
import { PiPlusBold } from 'react-icons/pi';
import { ListExpenditureColumn } from '@/app/shared/financial/expenses/column';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { CreateExpenses } from '@/app/shared/financial/expenses/create-expenses';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { Expenses } from '@/types';
import TableLayout from '../../tables/table-layout';

export default function Expenditure() {
   const [expenditureData, setExpenditureData] = useState<Expenses[]>([]);
   const [loading, setLoading] = useState(false);

   const { openModal } = useModal();

   async function getExpenses() {
      setLoading(true);
      try {
         const response = await apiCall(() => api.get<Expenses[]>('/expenses'));

         if (!response) {
            return;
         }

         response.data.sort((a, b) => {
            if (a.name && b.name && a.name < b.name) {
               return -1;
            }
            if (a.name && b.name && a.name > b.name) {
               return 1;
            }
            return 0;
         });

         setExpenditureData(response.data);
         setLoading(loading);
      } catch (error) {
         console.error('Erro ao buscar despesas:', error);
         if ((error as any)?.response?.status === 401) {
            localStorage.clear();
            redirect('/signin');
         }
      }finally{
         setLoading(false);
      }
   }

   useEffect(() => {
      getExpenses();
   }, []);

   const pageHeader = {
      title: 'Despesas',
      breadcrumb: [
         {
            // href: routes.dashboard,
            name: 'Dashboard',
         },
         {
            name: 'Despesas',
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
                     <ModalForm title="Cadastro de despesas">
                        <CreateExpenses getExpenses={getExpenses} />
                     </ModalForm>
                  ),
                  customSize: '620px',
                  size: 'lg',
               })
            }
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={expenditureData}
            fileName="despesas"
            header=""
            action="Criar despesa"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <TableComponent
               title=""
               column={ListExpenditureColumn(getExpenses)}
               variant="classic"
               data={expenditureData}
               tableHeader={true}
               searchAble={true}
               pagination={true}
               loading={loading}
            />
         </TableLayout>
      </div>
   );
}
