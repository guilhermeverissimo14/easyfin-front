'use client';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

import { routes } from '@/config/routes';
import { useModal } from '@/app/shared/modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { ProducersType } from '@/types';
import { PiPlusBold } from 'react-icons/pi';
import TableComponent from '@/components/tables/table';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { ListProducerColumn } from '@/app/shared/producers/column';
import TableLayout from '../tables/table-layout';
import { CreateProducer } from '@/app/shared/producers/create-producer';

export default function Spendings() {
   const [producerData, setProducerData] = useState<ProducersType[]>([]);
   const [loading, setLoading] = useState(false);

   const { openModal } = useModal();

   const getProducers = async () => {
      try {
         setLoading(true);

         const response = await apiCall(() => api.get('/producers'));
         setProducerData(response?.data);
      } catch (error) {
         console.error('Erro ao buscar produtores:', error);
         if ((error as any)?.response?.status === 401) {
            localStorage.clear();
            redirect('/signin');
         }
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      getProducers();
   }, []);

   const pageHeader = {
      title: 'Produtores rurais',
      breadcrumb: [
         {
            // href: routes.dashboard,
            name: 'Dashboard',
         },
         {
            name: 'Produtores',
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
                     <ModalForm title="Cadastro de produtor" width={true}>
                        <CreateProducer getList={getProducers} />
                     </ModalForm>
                  ),
                  size: 'lg',
                  customSize: '1024px',
               })
            }
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={producerData || []}
            fileName="gastos"
            header=""
            action="Cadastrar produtor"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <TableComponent
               title=""
               column={ListProducerColumn(getProducers)}
               variant="classic"
               data={producerData || []}
               tableHeader={true}
               searchAble={true}
               pagination={true}
               loading={loading}
            />
         </TableLayout>
      </div>
   );
}
