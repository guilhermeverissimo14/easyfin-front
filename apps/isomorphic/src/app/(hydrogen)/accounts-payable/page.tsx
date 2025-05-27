'use client';
import { useEffect, useState } from 'react';
import { PiPlusBold } from 'react-icons/pi';

import TableComponent from '@/components/tables/table';
import ModalForm from '@/components/modal/modal-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { ListAccountsPayableColumn } from '@/app/shared/accounts-payable/column';
import { HeaderInfoDetails } from '@/app/shared/accounts-payable/header-info-details';
import TableLayout from '../tables/table-layout';
import { IAccountsPayable } from '@/types';
import { NewAccountPayable } from '@/app/shared/accounts-payable/new-account-payable';

const accountsPayableMock: IAccountsPayable[] = [
   {
      id: '1',
      documentNumber: '001',
      supplierId: '123',
      supplierName: 'Fornecedor A',
      status: 'Pendente',
      launchDate: '2025-05-01',
      dueDate: '2025-06-01',
      installmentNumber: 1,
      totalInstallments: 1,
      value: 20000,
   },
   {
      id: '2',
      documentNumber: '002',
      supplierId: '124',
      supplierName: 'Fornecedor B',
      status: 'Atrasado',
      launchDate: '2025-05-02',
      dueDate: '2025-05-17',
      installmentNumber: 1,
      totalInstallments: 2,
      value: 15000,
   },
   {
      id: '3',
      documentNumber: '003',
      supplierId: '124',
      supplierName: 'Fornecedor B',
      status: 'Pendente',
      launchDate: '2025-05-02',
      dueDate: '2025-06-02',
      installmentNumber: 2,
      totalInstallments: 2,
      value: 15000,
   },
];

export default function AccountsPayable() {
   const [data, setData] = useState<IAccountsPayable[]>(accountsPayableMock);
   const [loading, setLoading] = useState(false);

   const { openModal } = useModal();

   const pageHeader = {
      title: 'Contas a Pagar',
      breadcrumb: [
         {
            name: 'Dashboard',
         },
         {
            name: 'Contas a Pagar',
         },
      ],
   };

   const getData = () => {
      setData(accountsPayableMock);
   };

   return (
      <div className="mt-8">
         <TableLayout
            openModal={() =>
               openModal({
                  view: (
                     <ModalForm title="Contas a Pagar">
                        <NewAccountPayable getAccounts={getData} />
                     </ModalForm>
                  ),
                  size: 'md',
               })
            }
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={data}
            fileName="contas-bancarias"
            header=""
            action="Lançar Conta"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <HeaderInfoDetails />
            <TableComponent
               title=""
               column={ListAccountsPayableColumn(getData)}
               variant="classic"
               data={data}
               tableHeader={true}
               searchAble={false}
               pagination={true}
               loading={loading}
            />
         </TableLayout>
      </div>
   );
}
