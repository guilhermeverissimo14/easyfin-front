'use client';
import { useEffect, useState } from 'react';
import { PiPlusBold } from 'react-icons/pi';

import TableComponent from '@/components/tables/table';
import ModalForm from '@/components/modal/modal-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { ListCashBookColumn } from '@/app/shared/cash-book/column';
import { HeaderInfoDetails } from '@/app/shared/cash-book/header-info-details';
import TableLayout from '../tables/table-layout';
import { ICashBook } from '@/types';
import { RegisterTransaction } from '@/app/shared/cash-book/register-transaction';

const transactionsMock = [
   {
      id: '1',
      date: '2025-05-24',
      historic: 'Pix - Recebido',
      value: 15000,
      type: 'C',
      description: 'Transferência de cliente X',
      costCenter: 'Despesas Refeição',
      balance: 525000,
   },
   {
      id: '2',
      date: '2025-05-24',
      historic: 'Compra com Cartão',
      value: 30000,
      type: 'D',
      description: 'Impostos FGTS',
      costCenter: 'Compras',
      balance: 495000,
   },
   {
      id: '3',
      date: '2025-05-25',
      historic: 'Cobrança com Registro',
      value: 20000,
      type: 'C',
      description: 'Recebimento de cobrança Z',
      costCenter: 'Fretes Transportes',
      balance: 515000,
   },
   {
      id: '4',
      date: '2025-05-26',
      historic: 'Pagamento Fornecedor',
      value: 20000,
      type: 'D',
      description: 'Pagamento de fornecedor Y',
      costCenter: 'Fornecedores',
      balance: 495000,
   },
];

export default function CashBook() {
   const [transactions, setTransactions] = useState<ICashBook[]>(transactionsMock);
   const [loading, setLoading] = useState(false);

   const { openModal } = useModal();

   const pageHeader = {
      title: 'Livro Caixa',
      breadcrumb: [
         {
            name: 'Dashboard',
         },
         {
            name: 'Livro Caixa',
         },
      ],
   };

   const getTransactions = () => {
      setTransactions(transactionsMock);
   };

   return (
      <div className="mt-8">
         <TableLayout
            openModal={() =>
               openModal({
                  view: (
                     <ModalForm title="Registro de Lançamento">
                        <RegisterTransaction getCashBook={getTransactions} />
                     </ModalForm>
                  ),
                  size: 'md',
               })
            }
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={transactions}
            columns={ListCashBookColumn(getTransactions)}
            fileName="livro-caixa"
            header=""
            action="Registrar Lançamento"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <HeaderInfoDetails />
            <TableComponent
               title=""
               column={ListCashBookColumn(getTransactions)}
               variant="classic"
               data={transactions}
               tableHeader={true}
               searchAble={true}
               pagination={false}
               loading={loading}
            />
         </TableLayout>
      </div>
   );
}
