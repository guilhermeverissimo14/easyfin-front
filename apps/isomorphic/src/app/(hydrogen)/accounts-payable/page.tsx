'use client';
import { useEffect, useState } from 'react';
import { PiPlusBold } from 'react-icons/pi';
import { MdOutlineManageSearch } from 'react-icons/md';
import TableComponent from '@/components/tables/table';
import ModalForm from '@/components/modal/modal-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { ListAccountsPayableColumn } from '@/app/shared/accounts-payable/column';
import { HeaderInfoDetails } from '@/app/shared/accounts-payable/header-info-details';
import TableLayout from '../tables/table-layout';
import { AccountsPayableResponse, FilterParams, IAccountsPayable, PaginationInfo } from '@/types';
import { NewAccountPayable } from '@/app/shared/accounts-payable/new-account-payable';
import { FilterAccountsPayable } from '@/app/shared/accounts-payable/filter-account-payable';
import { toast } from 'react-toastify';
import { apiCall } from '@/helpers/apiHelper';
import { TablePagination } from '@/components/tables/table-pagination';

export interface AccountsPayableFilterParams {
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

export default function AccountsPayable() {
  const [data, setData] = useState<IAccountsPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState<AccountsPayableFilterParams>({
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

  const mapApiDataToAccountsPayable = (apiData: AccountsPayableResponse[]): IAccountsPayable[] => {
    return apiData.map(item => ({
      id: item.id,
      documentNumber: item.documentNumber,
      supplierId: item.supplier?.id || '',
      supplierName: item.supplier?.name || '',
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
      paymentDate: item.paymentDate || '',
      hasCashFlow: item.hasCashFlow,
    }));
  };

  const buildQueryParams = (params: AccountsPayableFilterParams): string => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    return queryParams.toString();
  };

  const getData = async (newFilters?: AccountsPayableFilterParams) => {
    setLoading(true);
    const filters = newFilters || filterParams;
    
    try {
      const queryParams = buildQueryParams(filters);
      const endpoint = `/accounts-payable${queryParams ? `?${queryParams}` : ''}`;
      
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

        const mappedData = mapApiDataToAccountsPayable(dataArray);
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
      console.error('Erro ao buscar contas a pagar:', error);
      toast.error('Não foi possível carregar as contas a pagar');
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

  const handleFilter = async (filters: AccountsPayableFilterParams) => {
    const newFilters = { ...filters, page: 1 };
    await getData(newFilters);
  };

  const handleFilterWrapper = async (filters?: FilterParams) => {
    const newFilters: AccountsPayableFilterParams = { 
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
              <ModalForm title="Contas a Pagar">
                <NewAccountPayable getAccounts={getData} />
              </ModalForm>
            ),
            size: 'md',
          })
        }
        openModalFilter={() =>
          openModal({
            view: (
              <ModalForm title="Pesquisa Avançada">
                <FilterAccountsPayable getAccounts={handleFilterWrapper} />
              </ModalForm>
            ),
            size: 'md',
          })
        }
        breadcrumb={pageHeader.breadcrumb}
        title={pageHeader.title}
        columns={ListAccountsPayableColumn(getData)}
        data={data}
        fileName="contas-a-pagar"
        header=""
        action={userRole === 'ADMIN' ? "Lançar Conta" : ""}
        filter="Pesquisa avançada"
        icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
        iconFilter={<MdOutlineManageSearch className="me-1.5 h-[17px] w-[17px]" />}
      >
        <HeaderInfoDetails refreshTrigger={refreshTrigger} />
        <TableComponent
          title=""
          column={ListAccountsPayableColumn(getData)}
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