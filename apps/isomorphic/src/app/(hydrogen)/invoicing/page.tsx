'use client';
import { useEffect, useRef, useState } from 'react';
import { PiPlusBold, PiDownloadSimpleBold } from 'react-icons/pi';

import TableComponent from '@/components/tables/table';
import ModalForm from '@/components/modal/modal-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { ListInvoicingColumn } from '@/app/shared/invoicing/column';
import { HeaderInfoDetailsRef } from '@/app/shared/cash-book/header-info-details';
import TableLayout from '../tables/table-layout';
import { IInvoice } from '@/types';
import { toast } from 'react-toastify';
import { apiCall } from '@/helpers/apiHelper';
import { CreateInvoice } from '@/app/shared/invoicing/create-invoicing';

export default function Invoicing() {
   const { openModal } = useModal();

   const [loading, setLoading] = useState(true);
   const [invoices, setInvoices] = useState<IInvoice[]>([]);

   const pageHeader = {
      title: 'Faturamento',
      breadcrumb: [
         {
            name: 'Dashboard',
         },
         {
            name: 'Faturamento',
         },
         {
            name: 'Notas Fiscais',
         },
      ],
   };

    const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

   const getInvoices = async () => {
      setLoading(true);
      try {
         const response = await apiCall(() => api.get('/invoices'));
         if (response?.data) {
            setInvoices(response.data);
         }
      } catch (error) {
         toast.error('Ocorreu um erro ao carregar as faturas');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      getInvoices();
   }, []);

   return (
      <div className="mt-8">
         <TableLayout
            openModal={() =>
               openModal({
                  view: (
                     <ModalForm title="Registro de Nota Fiscal">
                        <CreateInvoice getInvoices={getInvoices} />
                     </ModalForm>
                  ),
                  size: 'lg',
               })
            }
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={invoices}
            columns={ListInvoicingColumn(getInvoices)}
            fileName="nota-fiscal"
            header=""
            action={userRole === 'ADMIN' ? "Digitar Nota" : ""}
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            iconImport={<PiDownloadSimpleBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <TableComponent
               title=""
               column={ListInvoicingColumn(getInvoices)}
               variant="classic"
               data={invoices}
               tableHeader={true}
               searchAble={true}
               pagination={true}
               loading={loading}
            />
         </TableLayout>
      </div>
   );
}
