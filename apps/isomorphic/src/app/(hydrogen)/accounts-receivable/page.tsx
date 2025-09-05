'use client';
import { useEffect, useState } from 'react';
import { PiPlusBold } from 'react-icons/pi';
import { MdOutlineManageSearch } from 'react-icons/md';
import TableComponent from '@/components/tables/table';
import ModalForm from '@/components/modal/modal-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { ListAccountsReceivableColumn } from '@/app/shared/accounts-receivable/column';
import { HeaderInfoDetails } from '@/app/shared/accounts-receivable/header-info-details';
import TableLayout from '../tables/table-layout';
import { AccountsReceivableResponse, FilterParams, IAccountsReceivable, PaginationInfo } from '@/types';
import { NewAccountReceivable } from '@/app/shared/accounts-receivable/new-account-receivable';
import { toast } from 'react-toastify';
import { FilterAccountsReceivable } from '@/app/shared/accounts-receivable/filter-account-receivable';
import { apiCall } from '@/helpers/apiHelper';
import { TablePagination } from '@/components/tables/table-pagination';

export interface AccountsReceivableFilterParams {
  page?: number;
  limit?: number;
  customerId?: string;
  supplierId?: string;
  costCenterId?: string;
  status?: string;
  paymentMethodId?: string;
  documentDateStart?: string;
  documentDateEnd?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
}

export default function AccountsReceivable() {
   const [data, setData] = useState<IAccountsReceivable[]>([]);
   const [loading, setLoading] = useState(true);
   const [filterParams, setFilterParams] = useState<AccountsReceivableFilterParams>({
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
   const [refreshTrigger, setRefreshTrigger] = useState(0);

   const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

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

   const mapApiDataToAccountsReceivable = (apiData: AccountsReceivableResponse[]): IAccountsReceivable[] => {
      return apiData.map((item) => ({
         id: item.id,
         documentNumber: item.documentNumber,
         customerId: item.customer?.id || '',
         customerName: item.customer?.name || '',
         status: item.status,
         documentDate: item.documentDate,
         launchDate: item.launchDate,
         dueDate: item.dueDate,
         installmentNumber: item.installmentNumber,
         totalInstallments: item.totalInstallments,
         value: item.value,
         plannedPaymentMethod: item.plannedPaymentMethod?.name || '',
         paymentMethodId: item.paymentMethod?.id || '',
         costCenterId: item.costCenter?.id || '',
         costCenterName: item.costCenter?.name || '',
         observation: item.observation,
         paymentDate: item.receiptDate || '',
         hasInvoiceLink: item.hasInvoiceLink,
         hasCashFlow: item.hasCashFlow,
      }));
   };

   const buildQueryParams = (params: AccountsReceivableFilterParams): string => {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
         if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
         }
      });

      return queryParams.toString();
   };

   const getData = async (newFilters?: AccountsReceivableFilterParams) => {
      setLoading(true);
      const filters = newFilters || filterParams;

      try {
         const queryParams = buildQueryParams(filters);
         const endpoint = `/accounts-receivable${queryParams ? `?${queryParams}` : ''}`;

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

            const mappedData = mapApiDataToAccountsReceivable(dataArray);
            setData(mappedData);
            setPagination(paginationInfo);
            
            if (newFilters) {
               setFilterParams(newFilters);
            }
            setRefreshTrigger(prev => prev + 1);
         } else {
            setData([]);
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
         console.error('Erro ao buscar contas a receber:', error);
         toast.error('Não foi possível carregar as contas a receber');
         setData([]);
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
      getData(newFilters);
   };

   const handleLimitChange = (limit: number) => {
      const newFilters = { ...filterParams, limit, page: 1 };
      getData(newFilters);
   };

   const handleFilter = async (filters: AccountsReceivableFilterParams) => {
      const newFilters = { ...filters, page: 1 };
      await getData(newFilters);
   };

   const handleFilterWrapper = async (filters?: FilterParams) => {
      const newFilters: AccountsReceivableFilterParams = { 
         ...filters, 
         page: 1,
         limit: filterParams.limit 
      };
      await getData(newFilters);
   };

   useEffect(() => {
      getData();
   }, []);

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
            openModalFilter={() =>
               openModal({
                  view: (
                     <ModalForm title="Pesquisa Avançada">
                        <FilterAccountsReceivable getAccounts={handleFilterWrapper} />
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
            action={userRole === 'ADMIN' ? "Lançar Conta" : ""}
            filter="Pesquisa avançada"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            iconFilter={<MdOutlineManageSearch className="me-1.5 h-[17px] w-[17px]" />}
         >
            <HeaderInfoDetails refreshTrigger={refreshTrigger} />
            <TableComponent
               title=""
               column={ListAccountsReceivableColumn(getData)}
               variant="classic"
               data={data}
               tableHeader={true}
               searchAble={false}
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
