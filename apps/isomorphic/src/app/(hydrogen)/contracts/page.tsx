'use client';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

import { routes } from '@/config/routes';
import { useModal } from '@/app/shared/modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { ContractsType} from '@/types';
import { PiPlusBold } from 'react-icons/pi';
import TableComponent from '@/components/tables/table';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import TableLayout from '../tables/table-layout';
import { ListContractsColumn } from '@/app/shared/contracts/column';
import { CreateContracts } from '@/app/shared/contracts/create-contracts';

export default function Contracts() {
   const [contractData, setContractData] = useState<ContractsType[]>([]);
   const [loading, setLoading] = useState(false);

   const { openModal } = useModal();

   const getContracts = async () => {

      let response;
      setLoading(true);
      try {
         response = await apiCall(() => api.get<ContractsType[]>('/service-contracts'));

         if (!response) {
            return;
         }

         setContractData(response.data);
      } catch (error) {
         console.error('Erro ao buscar contratos:', error);
         if ((error as any)?.response?.status === 401) {
            localStorage.clear();
            redirect('/signin');
         }
      }finally{
         setLoading(false);
      }
   };

   const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role?: string })?.role;

   useEffect(() => {
      getContracts();
   }, []);

   const pageHeader = {
      title: 'Contratos de serviços',
      breadcrumb: [
         {
            // href: routes.dashboard,
            name: 'Dashboard',
         },
         {
            name: 'Contratos',
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
                     <ModalForm title="Cadastrar contrato">
                        <CreateContracts getList={getContracts} />
                     </ModalForm>
                  ),
                  customSize: '900px',
               })
            }
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={contractData}
            fileName="gastos"
            header=""
            action={userRole ==='LOCAL_MANAGER' ? 'Criar contrato' : ''}
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <TableComponent
               title=""
               column={ListContractsColumn(getContracts)}
               variant="classic"
               data={contractData}
               tableHeader={true}
               searchAble={true}
               pagination={true}
               loading={loading}
            />
         </TableLayout>
      </div>
   );
}
