'use client';
import { useEffect, useRef, useState } from 'react';
import { PiPlusBold, PiDownloadSimpleBold } from 'react-icons/pi';

import TableComponent from '@/components/tables/table';
import ModalForm from '@/components/modal/modal-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { ListCashBookColumn } from '@/app/shared/cash-book/column';
import { HeaderInfoDetails, HeaderInfoDetailsRef } from '@/app/shared/cash-book/header-info-details';
import TableLayout from '../tables/table-layout';
import { ICashBook } from '@/types';
import { RegisterTransaction } from '@/app/shared/cash-book/register-transaction';
import { toast } from 'react-toastify';
import { apiCall } from '@/helpers/apiHelper';
import ImportExtractModal from '@/components/import-button/import-button';

export default function CashBook() {
   const [transactions, setTransactions] = useState<ICashBook[]>([]);
   const [loading, setLoading] = useState(true);
   const [settings, setSettings] = useState({
      cashFlowDefault: '',
      bankAccountDefault: '',
   });
   const [cashBoxId, setCashBoxId] = useState<string | null>(null);
   const [bankDetails, setBankDetails] = useState({
      name: '',
      agency: '',
      account: '',
   });

   const { openModal } = useModal();
   const headerInfoRef = useRef<HeaderInfoDetailsRef>(null);

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

   const getTransactions = async () => {
      try {
         setLoading(true);

         const currentSettings = await fetchSettings();
         const cashFlowMode = currentSettings?.cashFlowDefault || settings.cashFlowDefault;
         const defaultBankId = currentSettings?.bankAccountDefault || settings.bankAccountDefault;

         if (defaultBankId) {
            fetchBankDetails(defaultBankId);
         }

         let response;

         if (cashFlowMode === 'CASH') {
            response = await apiCall(() => api.get('/cash-flow/cash'));
            setCashBoxId(response?.data[0].cashBoxId);
         } else if (cashFlowMode === 'BANK') {
            response = await apiCall(() => api.get(`/cash-flow/account/${defaultBankId}`));
         }

         if (response?.data) {
            const formattedData = response.data.map((item: any) => ({
               id: item.id,
               date: item.date,
               historic: item.historic,
               value: parseFloat(item.value),
               type: item.type === 'CREDIT' ? 'C' : 'D',
               description: item.description || '',
               costCenter: item.costCenter?.name || '',
               balance: item.balance ? parseFloat(item.balance) : 0,
            }));

            setTransactions(formattedData);
         } else {
            setTransactions([]);
         }
         headerInfoRef.current?.fetchTotals();
      } catch (error) {
         console.error('Erro ao carregar transações:', error);
         toast.error('Erro ao carregar dados do livro caixa');
         setTransactions([]);
      } finally {
         setLoading(false);
      }
   };

   const openImportModal = () => {
      openModal({
         view: (
            <ModalForm title="Importar Extrato Bancário">
               <ImportExtractModal
                  bankAccountId={settings.bankAccountDefault}
                  bankName={bankDetails.name}
                  bankAgency={bankDetails.agency}
                  bankAccount={bankDetails.account}
                  onSuccess={getTransactions}
               />
            </ModalForm>
         ),
         size: 'md',
      });
   };

   useEffect(() => {
      getTransactions();
   }, []);

   return (
      <div className="mt-8">
         <TableLayout
            openModal={() =>
               openModal({
                  view: (
                     <ModalForm title="Registro de Lançamento">
                        <RegisterTransaction
                           getCashBook={getTransactions}
                           bankAccountId={settings.bankAccountDefault}
                           refreshTotals={() => headerInfoRef.current?.fetchTotals()}
                           cashBookId={cashBoxId ?? undefined}
                           cashFlowMode={settings.cashFlowDefault}
                        />
                     </ModalForm>
                  ),
                  size: 'md',
               })
            }
            openModalImport={openImportModal}
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={transactions}
            columns={ListCashBookColumn(getTransactions)}
            fileName="livro-caixa"
            header=""
            action="Registrar Lançamento"
            importLabel="Importar Extrato"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            iconImport={<PiDownloadSimpleBold className="me-1.5 h-[17px] w-[17px]" />}
         >

         {(settings.cashFlowDefault === 'BANK' && settings.bankAccountDefault) || 
          (settings.cashFlowDefault === 'CASH' && cashBoxId) ? (
            <HeaderInfoDetails
               ref={headerInfoRef}
               cashFlowMode={settings.cashFlowDefault}
               bankAccountId={settings.bankAccountDefault}
               cashBoxId={cashBoxId ?? undefined}
            />
         ) : (
            <div className="flex justify-center p-6">
               Carregando dados...
            </div>
         )}

            <TableComponent
               title=""
               column={ListCashBookColumn(getTransactions)}
               variant="classic"
               data={transactions}
               tableHeader={true}
               searchAble={true}
               pagination={true}
               loading={loading}
            />
         </TableLayout>
      </div>
   );
}