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
import { IInvoice, PaginationInfo } from '@/types';
import { toast } from 'react-toastify';
import { apiCall } from '@/helpers/apiHelper';
import { CreateInvoice } from '@/app/shared/invoicing/create-invoicing';
import { TablePagination } from '@/components/tables/table-pagination';

export interface InvoicingFilterParams {
  page?: number;
  limit?: number;
}

export default function Invoicing() {
   const { openModal } = useModal();

   const [loading, setLoading] = useState(true);
   const [invoices, setInvoices] = useState<IInvoice[]>([]);
   const [filterParams, setFilterParams] = useState<InvoicingFilterParams>({
      page: 1,
      limit: 10,
   });
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

   const buildQueryParams = (params: InvoicingFilterParams): string => {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
         if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
         }
      });

      return queryParams.toString();
   };

   const getInvoices = async (newFilters?: InvoicingFilterParams) => {
      setLoading(true);
      const filters = newFilters || filterParams;
      
      try {
         const queryParams = buildQueryParams(filters);
         const endpoint = `/invoices${queryParams ? `?${queryParams}` : ''}`;
         
         const response = await apiCall(() => api.get(endpoint));
         
         if (response?.data) {
            let dataArray = [];
            let paginationInfo: PaginationInfo = {
               page: 1,
               limit: 10,
               totalCount: 0,
               totalPages: 0,
               hasNextPage: false,
               hasPreviousPage: false,
            };

            // Verifica se a resposta tem estrutura de paginação
            if (response.data.data && response.data.pagination) {
               dataArray = response.data.data;
               paginationInfo = response.data.pagination;
            } else if (Array.isArray(response.data)) {
               dataArray = response.data;
            }

            setInvoices(dataArray);
            setPagination(paginationInfo);
            
            if (newFilters) {
               setFilterParams(newFilters);
            }
         } else {
            setInvoices([]);
            setPagination({
               page: 1,
               limit: 10,
               totalCount: 0,
               totalPages: 0,
               hasNextPage: false,
               hasPreviousPage: false,
            });
         }
      } catch (error) {
         toast.error('Ocorreu um erro ao carregar as faturas');
         setInvoices([]);
         setPagination({
            page: 1,
            limit: 10,
            totalCount: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
         });
      } finally {
         setLoading(false);
      }
   };

   const handlePageChange = (page: number) => {
      const newFilters = { ...filterParams, page };
      getInvoices(newFilters);
   };

   const handleLimitChange = (limit: number) => {
      const newFilters = { ...filterParams, limit, page: 1 };
      getInvoices(newFilters);
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
