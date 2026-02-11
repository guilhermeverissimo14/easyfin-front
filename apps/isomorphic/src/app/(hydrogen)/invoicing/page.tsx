'use client';
import { useEffect, useState } from 'react';
import { PiPlusBold, PiDownloadSimpleBold } from 'react-icons/pi';
import { MdOutlineManageSearch } from 'react-icons/md';
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
import { FilterInvoicingAdvanced } from '@/app/shared/invoicing/filter-invoicing-advanced';

export interface InvoicingFilterParams {
   page?: number;
   limit?: number;
   invoiceNumber?: string;
   customerId?: string;
   customer?: string;
   bankAccountId?: string;
   paymentConditionId?: string;
   costCenterId?: string;
   issueDate?: string;
   issueDateStart?: string;
   issueDateEnd?: string;
   startDate?: string;
   endDate?: string;
   orderBy?: string;
   order?: string;
}

export default function Invoicing() {
   const { openModal } = useModal();

   const [loading, setLoading] = useState(false);
   const [invoices, setInvoices] = useState<IInvoice[]>([]);
   const [pagination, setPagination] = useState<PaginationInfo>(() => {
      const savedLimit = sessionStorage.getItem('invoicing-limit');
      const savedPage = sessionStorage.getItem('invoicing-page');
      return {
         page: savedPage ? parseInt(savedPage, 10) : 1,
         limit: savedLimit ? parseInt(savedLimit, 10) : 10,
         totalCount: 0,
         totalPages: 0,
         hasNextPage: false,
         hasPreviousPage: false,
      };
   });
   const [filterParams, setFilterParams] = useState<InvoicingFilterParams>(() => {
      const savedLimit = sessionStorage.getItem('invoicing-limit');
      const savedPage = sessionStorage.getItem('invoicing-page');
      return {
         page: savedPage ? parseInt(savedPage, 10) : 1,
         limit: savedLimit ? parseInt(savedLimit, 10) : 10,
         orderBy: 'issueDate',
         order: 'desc',
      };
   });
   const [sortState, setSortState] = useState<{ columnId: string; direction: 'asc' | 'desc' } | null>({
      columnId: 'issueDate',
      direction: 'desc'
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

   const columnToFieldMap: Record<string, string> = {
      'invoiceNumber': 'invoiceNumber',
      'customer': 'customer',
      'issueDate': 'issueDate',
      'dueDate': 'dueDate',
      'paymentCondition.description': 'paymentCondition',
      'paymentCondition.condition': 'paymentCondition',
      'serviceValue': 'serviceValue',
   };

   const buildQueryParams = (params: InvoicingFilterParams): string => {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
         if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
         }
      });

      return queryParams.toString();
   };

   const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
      const fieldName = columnToFieldMap[columnId] || columnId;
      setSortState({ columnId, direction });
      const newFilters = { 
         ...filterParams, 
         orderBy: fieldName, 
         order: direction,
         page: 1 
      };
      setFilterParams(newFilters);
      getInvoices(newFilters);
   };

   const getInvoices = async (newFilters?: InvoicingFilterParams) => {
      setLoading(true);
      try {
         const filters = newFilters || filterParams;
         const queryParams = buildQueryParams(filters);
         const endpoint = `/invoices${queryParams ? `?${queryParams}` : ''}`;
         
         const response = await apiCall(() => api.get(endpoint));

         if (!response) {
            return;
         }

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

            if (response.data.data && response.data.pagination) {
               dataArray = response.data.data;
               paginationInfo = response.data.pagination;
            } else if (Array.isArray(response.data)) {
               dataArray = response.data;
               paginationInfo = {
                  page: 1,
                  limit: 10,
                  totalCount: dataArray.length,
                  totalPages: 1,
                  hasNextPage: false,
                  hasPreviousPage: false,
               };
            }

            setInvoices(dataArray);
            setPagination(paginationInfo);

            if (newFilters) {
               setFilterParams(newFilters);
            }
         }
      } catch (error) {
         if ((error as any)?.response?.status === 401) {
            localStorage.clear();
            redirect('/signin');
         }
         console.error('Erro ao carregar notas fiscais:', error);
         toast.error('Erro ao carregar notas fiscais');
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
      sessionStorage.setItem('invoicing-page', page.toString());
      const newFilters = { 
         ...filterParams, 
         page,
         ...(sortState && {
            orderBy: columnToFieldMap[sortState.columnId] || sortState.columnId,
            order: sortState.direction
         })
      };
      getInvoices(newFilters);
   };

   const handleLimitChange = (limit: number) => {
      sessionStorage.setItem('invoicing-limit', limit.toString());
      sessionStorage.setItem('invoicing-page', '1');
      const newFilters = { 
         ...filterParams, 
         limit, 
         page: 1,
         ...(sortState && {
            orderBy: columnToFieldMap[sortState.columnId] || sortState.columnId,
            order: sortState.direction
         })
      };
      getInvoices(newFilters);
   };

   const handleFilter = async (filters: InvoicingFilterParams) => {
      // Preserva a ordenação atual ao aplicar filtros
      const newFilters = { 
         ...filters, 
         page: 1,
         ...(sortState && {
            orderBy: columnToFieldMap[sortState.columnId] || sortState.columnId,
            order: sortState.direction
         })
      };
      await getInvoices(newFilters);
   };

   const refreshCurrentPage = () => {
      const currentFilters = { ...filterParams, page: pagination.page, limit: pagination.limit };
      return getInvoices(currentFilters);
   };

   useEffect(() => {
      getInvoices();
   }, []);

   const openAdvancedFilterModal = () => {
      openModal({
         view: (
            <ModalForm title="Filtro Avançado - Notas Fiscais">
               <FilterInvoicingAdvanced onFilter={handleFilter} currentFilters={filterParams} />
            </ModalForm>
         ),
      });
   };

   return (
      <div className="mt-8">
         <TableLayout
            openModal={() =>
               openModal({
                  view: (
                     <ModalForm title="Registro de Nota Fiscal">
                        <CreateInvoice getInvoices={refreshCurrentPage} />
                     </ModalForm>
                  ),
                  size: 'lg',
               })
            }
            openModalFilter={openAdvancedFilterModal}
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={invoices}
            columns={ListInvoicingColumn(refreshCurrentPage)}
            fileName="nota-fiscal"
            header=""
            action={userRole === 'ADMIN' ? "Digitar Nota" : ""}
            filter="Filtro Avançado"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            iconImport={<PiDownloadSimpleBold className="me-1.5 h-[17px] w-[17px]" />}
            iconFilter={<MdOutlineManageSearch className="me-1.5 h-[17px] w-[17px]" />}
         >
            <TableComponent
               title=""
               column={ListInvoicingColumn(refreshCurrentPage)}
               variant="classic"
               data={invoices}
               tableHeader={true}
               searchAble={false}
               pagination={false}
               loading={loading}
               onSort={handleSort}
               sortState={sortState}
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
