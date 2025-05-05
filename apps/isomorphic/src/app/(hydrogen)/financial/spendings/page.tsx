'use client';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

import { routes } from '@/config/routes';
import TableLayout from '../../tables/table-layout';
import { useModal } from '@/app/shared/modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { SpendingsType} from '@/types';
import { PiPlusBold } from 'react-icons/pi';
import TableComponent from '@/components/tables/table';
import { ListSpendingsColumn } from '@/app/shared/financial/spendings/column';
import { CreateSpending } from '@/app/shared/financial/spendings/create-spending';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';

export default function Spendings() {
   const [spendingData, setSpendingData] = useState<SpendingsType[]>([]);
   const [loading, setLoading] = useState(false);

   const { openModal } = useModal();

   const getSpendings = async () => {

      setLoading(true);

      let response;

      try {
         response = await apiCall(() => api.get<SpendingsType[]>('/spendings'));

         if (!response) {
            return;
         }

         setSpendingData(response.data);
      } catch (error) {
         console.error('Erro ao buscar contas:', error);
         if ((error as any)?.response?.status === 401) {
            localStorage.clear();
            redirect('/signin');
         }
      }finally{
         setLoading(false);
      }
   };

   useEffect(() => {
      getSpendings();
   }, []);

   const pageHeader = {
      title: 'Lançamento de Despesa',
      breadcrumb: [
         {
            // href: routes.dashboard,
            name: 'Dashboard',
         },
         {
            name: 'Gastos',
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
                     <ModalForm title="Lançamento de despesa">
                        <CreateSpending getList={getSpendings} />
                     </ModalForm>
                  ),
                  customSize: '620px',
                  size: 'lg',
               })
            }
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={spendingData}
            fileName="gastos"
            header=""
            action="Lançar despesa"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <TableComponent
               title=""
               column={ListSpendingsColumn(getSpendings)}
               variant="classic"
               data={spendingData}
               tableHeader={true}
               searchAble={true}
               pagination={true}
               loading={loading}
            />
         </TableLayout>
      </div>
   );
}
