'use client';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { ContractsType } from '@/types';
import { PiPlusBold } from 'react-icons/pi';
import TableComponent from '@/components/tables/table';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import TableLayout from '../tables/table-layout';
import { ListProductionColumn } from '@/app/shared/production/column';

export default function Production() {
   const [contractData, setContractData] = useState<ContractsType[]>([]);
   const [loading, setLoading] = useState(false);

   const getContracts = async () => {
      try {
         setLoading(true);
         const userName = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { name: string }).name;
         const response = await apiCall(() => api.get<ContractsType[]>('/service-contracts'));
         if (!response) {
            return;
         }

         const filteredContracts = response.data.filter((contract) => contract.pilots?.some((pilot) => pilot.name === userName));
         setContractData(filteredContracts);
      } catch (error) {
         console.error('Erro ao buscar contratos:', error);
         if ((error as any)?.response?.status === 401) {
            localStorage.clear();
            redirect('/signin');
         }
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      getContracts();
   }, []);

   const pageHeader = {
      title: 'Minhas produções',
      breadcrumb: [
         {
            // href: routes.dashboard,
            name: 'Dashboard',
         },
         {
            name: 'Produção',
         },
         {
            name: 'Listagem',
         },
      ],
   };

   return (
      <div className="mt-8">
         <TableLayout
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={contractData}
            fileName="gastos"
            header=""
            action=""
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <TableComponent
               title=""
               column={ListProductionColumn(getContracts)}
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
