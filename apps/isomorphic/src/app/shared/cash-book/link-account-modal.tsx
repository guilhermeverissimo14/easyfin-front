'use client';

import { useState, useEffect } from 'react';
import { Button } from 'rizzui/button';
import { Text, Title } from 'rizzui';
import { PiCheckCircleBold, PiCircleBold, PiWarningBold } from 'react-icons/pi';
import { api } from '@/service/api';
import { toast } from 'react-toastify';
import { useModal } from '../modal-views/use-modal';
import { formatCurrency, formatDate } from '@/utils/format';

interface PendingAccount {
   id: string;
   documentNumber: string;
   documentDate: string | null;
   dueDate: string | null;
   value: number;
   customer?: {
      id: string;
      name: string;
   };
   supplier?: {
      id: string;
      name: string;
   };
}

interface LinkAccountModalProps {
   cashFlowId: string;
   transactionType: string;
   documentNumber?: string;
   history: string;
   value: string;
   onSuccess: () => void;
}

export function LinkAccountModal({ 
   cashFlowId, 
   transactionType, 
   documentNumber, 
   history, 
   value, 
   onSuccess 
}: LinkAccountModalProps) {
   const [accounts, setAccounts] = useState<PendingAccount[]>([]);
   const [selectedAccount, setSelectedAccount] = useState<PendingAccount | null>(null);
   const [loading, setLoading] = useState(true);
   const [linking, setLinking] = useState(false);
   const { closeModal } = useModal();

   const isCredit = transactionType === 'C';
   const accountType = isCredit ? 'receivable' : 'payable';
   const accountTypeLabel = isCredit ? 'Contas a Receber' : 'Contas a Pagar';
   const linkButtonLabel = isCredit ? 'Vincular ao Contas a Receber' : 'Vincular ao Contas a Pagar';
   const isAlreadyLinked = !!documentNumber;

   useEffect(() => {
      if (!isAlreadyLinked) {
         fetchPendingAccounts();
      } else {
         setLoading(false);
      }
   }, [accountType, isAlreadyLinked]);

   const fetchPendingAccounts = async () => {
      try {
         setLoading(true);
         const endpoint = isCredit ? '/accounts-receivable/pending' : '/accounts-payable/pending';
         const response = await api.get(endpoint);
         setAccounts(response.data);
      } catch (error) {
         console.error('Erro ao buscar contas pendentes:', error);
         toast.error('Erro ao carregar contas pendentes');
      } finally {
         setLoading(false);
      }
   };

   const handleLinkAccount = async () => {
      if (!selectedAccount) {
         toast.error('Selecione uma conta para vincular');
         return;
      }

      try {
         setLinking(true);
         const endpoint = isCredit 
            ? `/cash-flow/${cashFlowId}/link-receivable`
            : `/cash-flow/${cashFlowId}/link-payable`;
         
         await api.patch(endpoint, {
            documentNumber: selectedAccount.documentNumber
         });

         toast.success('Conta vinculada com sucesso!');
         onSuccess();
         closeModal();
      } catch (error: any) {
         console.error('Erro ao vincular conta:', error);
         const errorMessage = error.response?.data?.message || 'Erro ao vincular conta';
         toast.error(errorMessage);
      } finally {
         setLinking(false);
      }
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center p-8">
            <div className="text-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
               <Text>Carregando dados...</Text>
            </div>
         </div>
      );
   }

   // Exibe alerta se já estiver vinculado
   if (isAlreadyLinked) {
      return (
         <div className="w-full max-w-2xl">
            <div className="mb-6">
               <Title as="h3" className="text-lg font-semibold mb-2">
                  Lançamento já Vinculado
               </Title>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
               <div className="flex items-start space-x-3">
                  <PiWarningBold className="text-yellow-600 text-xl mt-0.5 flex-shrink-0" />
                  <div>
                     <Text className="font-medium text-yellow-800 mb-1">
                        Atenção! Este lançamento já está vinculado.
                     </Text>
                     <Text className="text-yellow-700">
                        Este lançamento de fluxo de caixa já está vinculado ao documento <span className="font-semibold">{documentNumber}</span>.
                     </Text>
                  </div>
               </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
               <Text className="font-medium text-gray-700 mb-2">Detalhes do Lançamento:</Text>
               <div className="space-y-1">
                  <Text className="text-sm text-gray-600">
                     <span className="font-medium">Histórico:</span> {history}
                  </Text>
                  <Text className="text-sm text-gray-600">
                     <span className="font-medium">Valor:</span> {value}
                  </Text>
                  <Text className="text-sm text-gray-600">
                     <span className="font-medium">Tipo:</span> {isCredit ? 'Crédito' : 'Débito'}
                  </Text>
                  <Text className="text-sm text-gray-600">
                     <span className="font-medium">Documento Vinculado:</span> {documentNumber}
                  </Text>
               </div>
            </div>

            <div className="flex justify-end">
               <Button
                  variant="outline"
                  onClick={closeModal}
               >
                  Fechar
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className="w-full max-w-4xl">
         <div className="mb-6">
            <Title as="h3" className="text-lg font-semibold mb-2">
               Selecione uma conta para vincular
            </Title>
            <Text className="text-gray-600">
               Tipo de lançamento: <span className="font-medium">{isCredit ? 'Crédito' : 'Débito'}</span>
            </Text>
            <Text className="text-gray-600">
               Listando: <span className="font-medium">{accountTypeLabel}</span>
            </Text>
         </div>

         {accounts.length === 0 ? (
            <div className="text-center py-8">
               <Text className="text-gray-500">
                  Nenhuma conta pendente encontrada para {accountTypeLabel.toLowerCase()}
               </Text>
            </div>
         ) : (
            <>
               <div className="max-h-96 overflow-y-auto border rounded-lg">
                  <div className="space-y-2 p-4">
                     {accounts.map((account) => (
                        <div
                           key={account.id}
                           onClick={() => setSelectedAccount(account)}
                           className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                              selectedAccount?.id === account.id
                                 ? 'border-blue-500 bg-blue-50'
                                 : 'border-gray-200'
                           }`}
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                 {selectedAccount?.id === account.id ? (
                                    <PiCheckCircleBold className="text-blue-500 text-xl" />
                                 ) : (
                                    <PiCircleBold className="text-gray-400 text-xl" />
                                 )}
                                 <div>
                                    <div className="flex items-center space-x-4">
                                       <Text className="font-medium">
                                          Doc: {account.documentNumber}
                                       </Text>
                                       <Text className="text-sm text-gray-600">
                                          {isCredit ? account.customer?.name : account.supplier?.name}
                                       </Text>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-1">
                                       {account.documentDate && (
                                          <Text className="text-sm text-gray-500">
                                             Data: {formatDate(account.documentDate)}
                                          </Text>
                                       )}
                                       {account.dueDate && (
                                          <Text className="text-sm text-gray-500">
                                             Vencimento: {formatDate(account.dueDate)}
                                          </Text>
                                       )}
                                    </div>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <Text className="font-semibold text-lg">
                                    {formatCurrency(account.value)}
                                 </Text>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="flex justify-end space-x-3 mt-6">
                  <Button
                     variant="outline"
                     onClick={closeModal}
                     disabled={linking}
                  >
                     Cancelar
                  </Button>
                  <Button
                     onClick={handleLinkAccount}
                     disabled={!selectedAccount || linking}
                  >
                     {linkButtonLabel}
                  </Button>
               </div>
            </>
         )}
      </div>
   );
}