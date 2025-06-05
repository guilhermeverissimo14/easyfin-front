'use client';
import { useEffect, useState } from 'react';
import { PiPlusBold } from 'react-icons/pi';

import TableComponent from '@/components/tables/table';
import ModalForm from '@/components/modal/modal-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { ListAccountsReceivableColumn } from '@/app/shared/accounts-receivable/column';
import { HeaderInfoDetails } from '@/app/shared/accounts-receivable/header-info-details';
import TableLayout from '../tables/table-layout';
import { IAccountsReceivable } from '@/types';
import { NewAccountReceivable } from '@/app/shared/accounts-receivable/new-account-receivable';

const accountsReceivableMock: IAccountsReceivable[] = [
   {
      id: '1',
      documentNumber: '001',
      customerId: '123',
      customerName: 'João da Silva',
      status: 'Aberto',
      documentDate: '2025-04-27',
      launchDate: '2025-05-01',
      dueDate: '2025-06-01',
      installmentNumber: 1,
      totalInstallments: 1,
      value: 20000,
      plannedPaymentMethod: 'Boleto',
   },
   {
      id: '2',
      documentNumber: '002',
      customerId: '124',
      customerName: 'Maria Oliveira',
      status: 'Atrasado',
      documentDate: '2025-04-30',
      launchDate: '2025-05-02',
      dueDate: '2025-05-17',
      installmentNumber: 1,
      totalInstallments: 2,
      value: 15000,
      plannedPaymentMethod: 'Boleto',
   },
   {
      id: '3',
      documentNumber: '003',
      customerId: '124',
      customerName: 'Maria Oliveira',
      status: 'Aberto',
      documentDate: '2025-04-30',
      launchDate: '2025-05-02',
      dueDate: '2025-06-20',
      installmentNumber: 2,
      totalInstallments: 2,
      value: 15000,
      plannedPaymentMethod: 'Boleto',
   },
];

export default function AccountsReceivable() {
   const [data, setData] = useState<IAccountsReceivable[]>(accountsReceivableMock);
   const [loading, setLoading] = useState(false);

   const { openModal } = useModal();

   const pageHeader = {
      title: 'Contas a Receber',
      breadcrumb: [
         {
            name: 'Dashboard',
         },
         {
            name: 'Contas a Receber',
         },
      ],
   };

   const getData = () => {
      setData(accountsReceivableMock);
   };

   return (
      <div className="mt-8">
         <TableLayout
            openModal={() =>
               openModal({
                  view: (
                     <ModalForm title="Contas a Receber">
                        <NewAccountReceivable getAccounts={getData} />
                     </ModalForm>
                  ),
                  size: 'md',
               })
            }
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            columns={ListAccountsReceivableColumn(getData)}
            data={data}
            fileName="contas-a-receber"
            header=""
            action="Lançar Conta"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <HeaderInfoDetails />
            <TableComponent
               title=""
               column={ListAccountsReceivableColumn(getData)}
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
