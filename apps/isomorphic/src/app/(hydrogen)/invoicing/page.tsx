'use client';
import { useEffect, useState } from 'react';
import { PiPlusBold, PiDownloadSimpleBold } from 'react-icons/pi';
import { redirect } from 'next/navigation';

import TableComponent from '@/components/tables/table';
import ModalForm from '@/components/modal/modal-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { ListInvoicingColumn } from '@/app/shared/invoicing/column';
import TableLayout from '../tables/table-layout';
import { IInvoice, PaginationInfo } from '@/types';
import { toast } from 'react-toastify';
import { apiCall } from '@/helpers/apiHelper';
import { CreateInvoice } from '@/app/shared/invoicing/create-invoicing';
import { TablePagination } from '@/components/tables/table-pagination';

export default function Invoicing() {
   const { openModal } = useModal();

   const [loading, setLoading] = useState(false);
   const [invoices, setInvoices] = useState<IInvoice[]>([]);
   const [allInvoices, setAllInvoices] = useState<IInvoice[]>([]);
   const [pagination, setPagination] = useState<PaginationInfo>({
      page: 1,
      limit: 10,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
   });

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
         const response = await apiCall(() => api.get<IInvoice[]>('/invoices'));

         if (!response) {
            return;
         }

         setAllInvoices(response.data);
         updatePaginatedData(response.data, 1, pagination.limit);
      } catch (error) {
         if ((error as any)?.response?.status === 401) {
            localStorage.clear();
            redirect('/signin');
         }
      } finally {
         setLoading(false);
      }
   };

   const updatePaginatedData = (data: IInvoice[], page: number, limit: number) => {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = data.slice(startIndex, endIndex);
      
      setInvoices(paginatedData);
      setPagination({
         page,
         limit,
         totalCount: data.length,
         totalPages: Math.ceil(data.length / limit),
         hasNextPage: endIndex < data.length,
         hasPreviousPage: page > 1,
      });
   };

   const handlePageChange = (page: number) => {
      updatePaginatedData(allInvoices, page, pagination.limit);
   };

   const handleLimitChange = (limit: number) => {
      updatePaginatedData(allInvoices, 1, limit);
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
               pagination={false}
               loading={loading}
            />
            
            <TablePagination 
               pagination={pagination} 
               onPageChange={handlePageChange} 
               onLimitChange={handleLimitChange} 
            />
         </TableLayout>
      </div>
   );
}
