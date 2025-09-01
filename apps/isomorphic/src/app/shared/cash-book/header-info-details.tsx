'use client';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { IoCalendarOutline } from 'react-icons/io5';
import { FaDotCircle } from 'react-icons/fa';
import { format } from 'date-fns';
import { CustomTooltip } from '@/components/custom-tooltip';
import { toast } from 'react-toastify';
import { api } from '@/service/api';
import { formatCurrency } from '@/utils/format';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { SelectField } from '@/components/input/select-field';
import ModalForm from '@/components/modal/modal-form';

interface HeaderInfoDetailsProps {
   cashFlowMode?: string;
   bankAccountId?: string;
   cashBoxId?: string;
   onBankAccountChange?: (bankId: string) => void;
}

export interface HeaderInfoDetailsRef {
   fetchTotals: () => Promise<void>;
}

interface TotalData {
   bankName?: string;
   bankAccountInfo?: string;
   totalEntries: number;
   totalExits: number;
   balance: number;
   date?: Date;
}

interface BankAccount {
   id: string;
   bank: string;
   agency: string;
   account: string;
}

export const HeaderInfoDetails = forwardRef<HeaderInfoDetailsRef, HeaderInfoDetailsProps>(
   ({ cashFlowMode, bankAccountId, cashBoxId, onBankAccountChange }, ref) => {
      const [loading, setLoading] = useState(true);
      const [totals, setTotals] = useState<TotalData | null>(null);
      const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
      const { openModal, closeModal } = useModal();

      const fetchTotals = async () => {
         try {
            setLoading(true);
            const currentDate = format(new Date(), 'yyyy-MM-dd');
            let params: Record<string, any> = { date: currentDate};

            if (cashFlowMode === 'BANK') {
               if (!bankAccountId) {
                  console.warn('Bank account ID is required for BANK mode');
                  setTotals(null);
                  return;
               }
               params.bankAccountId = bankAccountId;
               
            }else if (cashFlowMode === 'CASH') {
               // Para modo CASH, tentar usar o cashBoxId se disponível
               if (!cashBoxId) {
                  console.warn('Cash box ID is required for CASH mode');
                  setTotals(null);
                  return;
               } 
               params.cashId = cashBoxId;
            } else {
               console.warn('Cash flow mode not defined');
               setTotals(null);
               return;
            }
            
            const response = await api.get('/cash-flow/totals-per-day', {
               params,
            });

            if (response?.data) { 
               setTotals({
                  bankName: response.data.bankName,
                  bankAccountInfo: response.data.bankAccountInfo,
                  date: response.data.date ? new Date(response.data.date) : undefined,
                  totalEntries: parseFloat(response.data.totalEntries || 0),
                  totalExits: parseFloat(response.data.totalExits || 0),
                  balance: parseFloat(response.data.balance || 0)
               });
            }
         } catch (error) {
            console.error('Erro ao buscar totais:', error);
            setTotals(null);
         } finally {
            setLoading(false);
         }
      };

      const fetchSelectedBankAccount = async () => {
         if (cashFlowMode !== 'BANK' || !bankAccountId) return;
         
         try {
            const response = await api.get('/bank-accounts');
            if (response?.data) {
               const account = response.data.find((acc: BankAccount) => acc.id === bankAccountId);
               if (account) {
                  setSelectedBankAccount(account);
               }
            }
         } catch (error) {
            console.error('Erro ao buscar conta bancária:', error);
         }
      };

      const handleBankAccountChange = async (bankId: string) => {
         try {
            setLoading(true);
            
            await api.put('/settings', {
               cashFlowDefault: 'BANK',
               bankAccountDefault: bankId
            });
            
            if (onBankAccountChange) {
               onBankAccountChange(bankId);
            }
            
            fetchTotals();
            window.location.reload();
            
            toast.success('Conta bancária alterada com sucesso!');
         } catch (error) {
            console.error('Erro ao alterar conta bancária:', error);
            toast.error('Não foi possível alterar a conta bancária');
         } finally {
            setLoading(false);
         }
      };

      const openBankSelectionModal = () => {
         if (cashFlowMode !== 'BANK') return;
         
         openModal({
            view: (
               <ModalForm title="Selecionar Conta Bancária">
                  <BankAccountSelectionForm 
                     currentBankAccountId={bankAccountId}
                     onSubmit={handleBankAccountChange}
                     onCancel={closeModal}
                  />
               </ModalForm>
            ),
            size: 'sm',
         });
      };

      useImperativeHandle(ref, () => ({
         fetchTotals
      }));

      useEffect(() => {
         if (cashFlowMode) {
            fetchTotals();
            fetchSelectedBankAccount();
         }
      }, [cashFlowMode, bankAccountId, cashBoxId]);

      return (
         <div className="flex flex-col items-center gap-4 bg-white px-4 py-2 md:flex-row md:justify-between md:gap-0">
            <div className="flex flex-1 items-center space-x-4">

               <Image 
                  alt="Logo" 
                  src="/images/cashier.png" 
                  width={180} height={150}
               />

               <div className="flex w-full flex-col justify-center space-y-2 text-sm text-gray-700 md:w-auto md:text-base">
                  <div className="flex flex-row items-center space-x-2 text-gray-600">
                     <IoCalendarOutline size={26} />
                     <span className="text-xl font-semibold md:text-2xl">
                        {(new Date()).toLocaleDateString('pt-BR')}
                     </span>
                  </div>
                  <div className="ml-1 flex items-center space-x-3 text-green-600">
                     <FaDotCircle className="inline-block" />
                     <span className="text-gray-500">{formatCurrency(totals?.totalEntries || 0)} (Entradas)</span>
                  </div>
                  <div className="ml-1 flex items-center space-x-3 text-red-600">
                     <FaDotCircle className="inline-block" />
                     <span className="text-gray-500">{formatCurrency(totals?.totalExits || 0)} (Saídas)</span>
                  </div>
               </div>
            </div>

            <div className="flex w-full items-center justify-center md:w-1/4">
               {cashFlowMode === 'CASH' && (
                  <div className="flex flex-col items-center justify-center space-y-1 md:items-end">
                     <span className="text-sm text-gray-500 md:text-base">Modo Dinheiro</span>
                     <div className="text-base font-semibold md:text-lg">Fluxo de Caixa</div>
                  </div>
               )}

               {cashFlowMode === 'BANK' && (
                  <CustomTooltip text="Clique aqui para selecionar outra conta">
                     <div 
                        className="flex cursor-pointer flex-col items-center justify-center space-y-1 md:items-end"
                        onClick={openBankSelectionModal}
                     >
                        <span className="text-sm text-gray-500 md:text-base">{selectedBankAccount?.bank || ""}</span>
                        <div className="text-base font-semibold md:text-lg">
                           {selectedBankAccount ? `Agência ${selectedBankAccount.agency} - CC ${selectedBankAccount.account}` : ""}
                        </div>
                     </div>
                  </CustomTooltip>
               )}
            </div>

            <div className="flex w-full items-center justify-center md:w-1/4 md:justify-end">
               <div className="flex flex-col items-center justify-center space-y-1 md:items-end">
                  <span className="text-sm text-gray-500 md:text-base">Saldo</span>
                  <div className={`text-lg font-semibold md:text-xl ${totals?.balance && totals.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                     {formatCurrency(totals?.balance || 0)}
                  </div>
               </div>
            </div>
         </div>
      );
   }
);

function BankAccountSelectionForm({ 
   currentBankAccountId, 
   onSubmit, 
   onCancel 
}: {
   currentBankAccountId?: string;
   onSubmit: (bankId: string) => void;
   onCancel: () => void;
}) {
   const [loading, setLoading] = useState(false);
   const [bankAccounts, setBankAccounts] = useState([]);
   
   const { handleSubmit, control, formState: { errors } } = useForm({
      defaultValues: {
         bankAccountId: currentBankAccountId || '',
      }
   });
   
   const handleFormSubmit = (data: { bankAccountId: string }) => {
      setLoading(true);
      onSubmit(data.bankAccountId);
      onCancel();
      setLoading(false);
   };

   useEffect(()=>{
       const fetchBankAccounts = async () => {
         try {
            const response = await api.get('/bank-accounts');
            
            if (response?.data) {
               const accounts = response.data.map((account: any) => ({
                  label: `${account.bank} - Agência ${account.agency} - CC ${account.account}`,
                  value: account.id
               }));
               setBankAccounts(accounts);
            }
         } catch (error) {
            console.error('Erro ao buscar contas bancárias:', error);
            toast.error('Não foi possível carregar as contas bancárias');
         }
      };
      fetchBankAccounts();
   }, []);
   
   return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
         <Controller
            control={control}
            name="bankAccountId"
            render={({ field: { value, onChange } }) => (
               <SelectField
                  label="Conta Bancária"
                  placeholder="Selecione a conta bancária"
                  options={bankAccounts}
                  onChange={onChange}
                  value={value}
                  error={errors.bankAccountId?.message}
               />
            )}
         />
         
         <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
               Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
               {loading ? 'Alterando...' : 'Alterar Conta'}
            </Button>
         </div>
      </form>
   );
}

HeaderInfoDetails.displayName = 'HeaderInfoDetails';