'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PiPlusBold, PiDownloadSimpleBold } from 'react-icons/pi';
import { MdOutlineManageSearch } from 'react-icons/md';

import TableComponent from '@/components/tables/table';
import ModalForm from '@/components/modal/modal-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { ListCashBookColumn } from '@/app/shared/cash-book/column';
import { HeaderInfoDetails, HeaderInfoDetailsRef } from '@/app/shared/cash-book/header-info-details';
import TableLayout from '../tables/table-layout';
import { ICashBook, PaginationInfo } from '@/types';
import { RegisterTransaction } from '@/app/shared/cash-book/register-transaction';
import { toast } from 'react-toastify';
import { apiCall } from '@/helpers/apiHelper';
import ImportExtractModal from '@/components/import-button/import-button';
import { TablePagination } from '@/components/tables/table-pagination';
import { FilterCashBookAdvanced } from '@/app/shared/cash-book/filter-cash-book-advanced';

export interface CashBookFilterParams {
   page?: number;
   limit?: number;
   type?: string;
   description?: string;
   history?: string;
   costCenterId?: string;
   dateStart?: string;
   dateEnd?: string;
   valueMin?: string;
   valueMax?: string;
   cashId?: string;
   bankAccountId?: string;
}


export default function CashBook() {
   const [transactions, setTransactions] = useState<ICashBook[]>([]);
   const [loading, setLoading] = useState(true);
   const [settings, setSettings] = useState({
      cashFlowDefault: '',
      bankAccountDefault: '',
      cashBoxDefault: '',
   });
   const [cashBoxId, setCashBoxId] = useState<string | null>(null);
   const [bankDetails, setBankDetails] = useState({
      name: '',
      agency: '',
      account: '',
   });
   const [pagination, setPagination] = useState<PaginationInfo>({
      page: 1,
      limit: 10,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
   });
   const [filterParams, setFilterParams] = useState<CashBookFilterParams>({
      page: 1,
      limit: 10,
   });

   const { openModal } = useModal();
   const headerInfoRef = useRef<HeaderInfoDetailsRef>(null);

   const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

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

   const buildQueryParams = (params: CashBookFilterParams): string => {
      const queryParams = new URLSearchParams();
   
      Object.entries(params).forEach(([key, value]) => {
         if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
         }
      });
   
      return queryParams.toString();
   };

   const fetchSettings = async () => {
      try {
         const response = await apiCall(() => api.get('/settings'));

         if (!response?.data) {
            return;
         }

         if (response?.data) {
            setSettings({
               cashFlowDefault: response.data.cashFlowDefault || '',
               bankAccountDefault: response.data.bankAccountDefault || '',
               cashBoxDefault: response.data.cashBoxDefault || '',
            });
            return response.data;
         }
      } catch (error) {
         console.error('Erro ao carregar configurações:', error);
         toast.error('Erro ao carregar configurações do sistema');
         return null;
      }
   };

   const fetchBankDetails = async (bankId: string) => {
      try {
         const response = await apiCall(() => api.get(`/bank-accounts/${bankId}`));
         if (response?.data) {
            setBankDetails({
               name: response.data.bank || 'Banco',
               agency: response.data.agency || '',
               account: response.data.account || '',
            });
         }
      } catch (error) {
         console.error('Erro ao buscar detalhes do banco:', error);
      }
   };

   const getTransactions = async (newFilters?: CashBookFilterParams) => {
      try {
         setLoading(true);

         const currentSettings = await fetchSettings();
         const cashFlowMode = currentSettings?.cashFlowDefault || settings.cashFlowDefault;
         const defaultBankId = currentSettings?.bankAccountDefault || settings.bankAccountDefault;
         const defaultCashBoxId = currentSettings?.cashBoxDefault || settings.cashBoxDefault;

         if (defaultBankId && cashFlowMode === 'BANK') {
            fetchBankDetails(defaultBankId);
         }

         const filters = newFilters || filterParams;
         let response = null;

         if (cashFlowMode === 'CASH') {
            const queryParams = buildQueryParams({
               ...filters,
               cashId: filters.cashId || cashBoxId || defaultCashBoxId || undefined,
            });
            const endpoint = `/cash-flow/cash${queryParams ? `?${queryParams}` : ''}`;
            response = await apiCall(() => api.get(endpoint));
         } else if (cashFlowMode === 'BANK') {
            const queryParams = buildQueryParams({
               ...filters,
               bankAccountId: filters.bankAccountId || defaultBankId,
            });
            const endpoint = `/cash-flow/account/${defaultBankId}${queryParams ? `?${queryParams}` : ''}`;
            response = await apiCall(() => api.get(endpoint));
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
            }

            if (cashFlowMode === 'CASH' && dataArray.length > 0) {
               const newCashBoxId = dataArray[0]?.cashBoxId;
               if (newCashBoxId && newCashBoxId !== cashBoxId) {
                  setCashBoxId(newCashBoxId);
               }
            }
            if (dataArray.length === 0 && !newFilters) {
               // toast.info('Nenhum lançamento encontrado no livro caixa.');
               return;
            }

            const formattedData = dataArray.map((item: ICashBook) => ({
               id: item.id,
               date: item.date,
               history: item.history || 'Sem histórico',
               value: item.value,
               type: item.type === 'CREDIT' ? 'C' : 'D',
               description: item.description || '',
               costCenter: item.costCenter?.name || '',
               balance: item.balance,
            }));

            setTransactions(formattedData);
            setPagination(paginationInfo);
         } else {
            setTransactions([]);
            setPagination({
               page: 1,
               limit: 10,
               totalCount: 0,
               totalPages: 0,
               hasNextPage: false,
               hasPreviousPage: false,
            });
         }

         if (newFilters) {
            setFilterParams(newFilters);
         }

         headerInfoRef.current?.fetchTotals();
      } catch (error) {
         console.error('Erro ao carregar transações:', error);
         toast.error('Erro ao carregar dados do livro caixa');
         setTransactions([]);
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
      getTransactions(newFilters);
   };

   const handleLimitChange = (limit: number) => {
      const newFilters = { ...filterParams, limit, page: 1 };
      getTransactions(newFilters);
   };

   const handleFilter = async (filters: CashBookFilterParams) => {
      const newFilters = { ...filters, page: 1 };
      await getTransactions(newFilters);
   };

   const openAdvancedFilterModal = () => {
      openModal({
         view: (
            <ModalForm title="Filtro Avançado - Livro Caixa">
               <FilterCashBookAdvanced onFilter={handleFilter} currentFilters={filterParams} />
            </ModalForm>
         ),
      });
   };

   const openImportModal = () => {
      openModal({
         view: (
            <ModalForm title="Importar Extrato Bancário" customWidth="w-[1200px] max-w-[1600px] mx-auto">
               <ImportExtractModal onSuccess={getTransactions} />
            </ModalForm>
         ),
      });
   };

   useLayoutEffect(() => {
      getTransactions();
   }, [cashBoxId]);

   return (
      <div className="mt-8">
         <TableLayout
            openModal={() =>
               openModal({
                  view: (
                     <ModalForm title="Registro de Lançamento">
                        <RegisterTransaction
                           getCashBook={() => getTransactions()}
                           bankAccountId={settings.bankAccountDefault}
                           refreshTotals={() => headerInfoRef.current?.fetchTotals()}
                           cashBookId={cashBoxId || settings.cashBoxDefault || undefined}
                           cashFlowMode={settings.cashFlowDefault}
                        />
                     </ModalForm>
                  ),
                  size: 'md',
               })
            }
            openModalImport={openImportModal}
            openModalFilter={openAdvancedFilterModal}
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={transactions}
            columns={ListCashBookColumn(() => getTransactions())}
            fileName="livro-caixa"
            header=""
            action={userRole === 'ADMIN' ? "Registrar Lançamento" : ""}
            importLabel={userRole === 'ADMIN' && settings.cashFlowDefault === 'BANK' ? "Importar Extrato" : ""}
            filter="Filtro Avançado"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            iconImport={<PiDownloadSimpleBold className="me-1.5 h-[17px] w-[17px]" />}
            iconFilter={<MdOutlineManageSearch className="me-1.5 h-[17px] w-[17px]" />}
         >
            {(settings.cashFlowDefault === 'BANK' && settings.bankAccountDefault) || settings.cashFlowDefault === 'CASH' ? (
               <HeaderInfoDetails
                  ref={headerInfoRef}
                  cashFlowMode={settings.cashFlowDefault}
                  bankAccountId={settings.bankAccountDefault}
                  cashBoxId={cashBoxId ?? undefined}
               />
            ) : (
               <div className="flex justify-center p-6">Carregando dados...</div>
            )}

            <TableComponent
               title=""
               column={ListCashBookColumn(() => getTransactions())}
               variant="classic"
               data={transactions as any[]}
               tableHeader={true}
               searchAble={true}
               pagination={false}
               loading={loading}
            />

            <TablePagination pagination={pagination} onPageChange={handlePageChange} onLimitChange={handleLimitChange} />
         </TableLayout>
      </div>
   );
}
