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
import { AccountsPayableResponse, FilterParams, IAccountsPayable } from '@/types';
import { NewAccountPayable } from '@/app/shared/accounts-payable/new-account-payable';
import { FilterAccountsPayable } from '@/app/shared/accounts-payable/filter-account-payable';
import { toast } from 'react-toastify';
import { apiCall } from '@/helpers/apiHelper';


export default function AccountsPayable() {
  const [data, setData] = useState<IAccountsPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState<FilterParams>({});
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
     
      costCenterId: item.costCenter?.id || '',
      costCenterName: item.costCenter?.name || '',
      observation: item.observation,
      paymentDate: item.paymentDate || '',
    }));
  };

  const buildQueryParams = (params: FilterParams): string => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    return queryParams.toString();
  };

  const getData = async (newFilters?: FilterParams) => {
    setLoading(true);
    const filters = newFilters || filterParams;
    
    try {
      const queryParams = buildQueryParams(filters);
      const endpoint = `/accounts-payable${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await apiCall(()=> api.get<AccountsPayableResponse[]>(endpoint));
      const mappedData = response && response.data ? mapApiDataToAccountsPayable(response.data) : [];
      
      setData(mappedData);
      
      if (newFilters) {
        setFilterParams(newFilters);
      }
       setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
      toast.error('Não foi possível carregar as contas a pagar');
      setData([]);
    } finally {
      setLoading(false);
    }
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
                <FilterAccountsPayable getAccounts={getData} />
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
          pagination={true}
          loading={loading}
        />
      </TableLayout>
    </div>
  );
}