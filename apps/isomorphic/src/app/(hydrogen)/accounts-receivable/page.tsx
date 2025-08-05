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
import { AccountsReceivableResponse, FilterParams, IAccountsReceivable } from '@/types';
import { NewAccountReceivable } from '@/app/shared/accounts-receivable/new-account-receivable';
import { toast } from 'react-toastify';
import { FilterAccountsReceivable } from '@/app/shared/accounts-receivable/filter-account-receivable';
import { apiCall } from '@/helpers/apiHelper';

export default function AccountsReceivable() {
  const [data, setData] = useState<IAccountsReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState<FilterParams>({});
   const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    return apiData.map(item => ({
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
      const endpoint = `/accounts-receivable${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await apiCall(()=> api.get<AccountsReceivableResponse[]>(endpoint));
        const mappedData = response && response.data
        ? mapApiDataToAccountsReceivable(response.data)
        : [];
      
      setData(mappedData);
      
      if (newFilters) {
        setFilterParams(newFilters);
      }

      setRefreshTrigger(prev => prev + 1);

    } catch (error) {
      console.error('Erro ao buscar contas a receber:', error);
      toast.error('Não foi possível carregar as contas a receber');
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
                <FilterAccountsReceivable getAccounts={getData}  />
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
          pagination={true}
          loading={loading}
        />
      </TableLayout>
    </div>
  );
}