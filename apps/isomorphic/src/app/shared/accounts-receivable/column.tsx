'use client';

import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { api } from '@/service/api';
import { IAccountsReceivable } from '@/types';
import { formatCurrency, formatDate, moneyMask } from '@/utils/format';
import { GiTakeMyMoney } from 'react-icons/gi';
import { FiRotateCcw } from 'react-icons/fi';
import { Tooltip } from 'rizzui/tooltip';
import { Button } from 'rizzui/button';
import { ActionIcon } from 'rizzui/action-icon';
import PencilIcon from '@core/components/icons/pencil';
import EyeIcon from '@core/components/icons/eye';
import { useModal } from '../modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { SettleAccountReceivable } from './settle-account-receivable';
import { AccountReceivableDetails } from './account-receivable-details';
import { EditAccountReceivable } from './edit-account-receivable';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { InputField } from '@/components/input/input-field';

type CustomColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
   dataType?: 'date' | 'currency' | string;
};

const columnHelper = createColumnHelper<IAccountsReceivable>() as {
   accessor<TValue extends keyof IAccountsReceivable | null>(
      accessor: TValue,
      config: CustomColumnDef<
         IAccountsReceivable,
         TValue extends null ? unknown : IAccountsReceivable[TValue extends keyof IAccountsReceivable ? TValue : never]
      >
   ): CustomColumnDef<IAccountsReceivable, any>;
   display(config: CustomColumnDef<IAccountsReceivable, any>): CustomColumnDef<IAccountsReceivable, any>;
};

export const ListAccountsReceivableColumn = (getList: () => void) => {
   const { openModal } = useModal();
   const isMobile = window.innerWidth < 768;
   const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

   const ConfirmReversePayment = ({ id }: { id: string }) => {
      const { closeModal } = useModal();
      const [loading, setLoading] = useState(false);

      const {
         register,
         handleSubmit,
         formState: { errors },
      } = useForm<{ reason: string }>({ defaultValues: { reason: '' } });

      const handleConfirm = async (values: { reason: string }) => {
         const { reason } = values;
         if (!reason || reason.trim() === '') return;

         setLoading(true);
         try {
            await api.put(`/accounts-receivable/${id}/reverse`, { reason });
            toast.success('Pagamento estornado com sucesso!');
            getList();
            closeModal();
         } catch (err) {
            console.error('Erro ao estornar pagamento:', err);
            toast.error('Erro ao estornar pagamento');
         } finally {
            setLoading(false);
         }
      };

      return (
         <form onSubmit={handleSubmit(handleConfirm)} className="p-4">
            <p className="mb-3">Informe o motivo do estorno (campo obrigatório)</p>
            <InputField
               label="Motivo do estorno"
               placeholder="Descreva o motivo do estorno"
               type="text"
               register={register('reason', { required: 'Motivo é obrigatório' }) as any}
               error={errors.reason?.message}
            />

            <div className="mt-4 flex gap-3">
               <Button variant="outline" onClick={() => closeModal()} disabled={loading} type="button">
                  Cancelar
               </Button>
               <Button type="submit" disabled={loading}>
                  {loading ? 'Processando...' : 'Confirmar estorno'}
               </Button>
            </div>
         </form>
      );
   };

   const columns = [
      columnHelper.accessor('documentNumber', {
         id: 'documentNumber',
         size: 120,
         header: 'N Docto',
         cell: ({ row }) => <span className="font-medium">{row.original.documentNumber}</span>,
      }),
      columnHelper.accessor('customerName', {
         id: 'customerName',
         size: 280,
         header: 'Cliente',
         cell: ({ row }) => <span>{row.original.customerName}</span>,
      }),
      columnHelper.accessor('costCenterName', {
         id: 'costCenterName',
         size: 280,
         header: 'Centro de Custo',
         cell: ({ row }) => <span>{row.original.costCenterName}</span>,
      }),
      columnHelper.accessor('status', {
         id: 'status',
         size: 60,
         header: 'Status',
         cell: ({ row }) => {
            const status = row.original.status;

            if (status === 'PENDING') {
               return (
                  <div className="w-22">
                     <div className="border-1 cursor-pointer rounded-md border border-[#ABD2EF] bg-[#ABD2EF] px-2 py-1 text-center text-white">
                        Aberto
                     </div>
                  </div>
               );
            } else if (status === 'OVERDUE') {
               return (
                  <div className="w-20">
                     <div className="border-1 cursor-pointer rounded-md border border-red-400 bg-red-400 px-2 py-1 text-center text-white">
                        Vencido
                     </div>
                  </div>
               );
            } else if (status === 'PAID') {
               return (
                  <div className="w-22">
                     <div className="border-1 cursor-pointer rounded-md border border-green-400 bg-green-400 px-2 py-1 text-center text-white">
                        Recebido
                     </div>
                  </div>
               );
            } else if (status === 'CANCELED') {
               return (
                  <div className="w-22">
                     <div className="border-1 cursor-pointer rounded-md border border-gray-400 bg-gray-400 px-2 py-1 text-center text-white">
                        Cancelado
                     </div>
                  </div>
               );
            }

            return status;
         },
      }),
      columnHelper.accessor('dueDate', {
         id: 'dueDate',
         size: 60,
         header: 'Datas',
         cell: ({ row }) => (
            <div className="flex flex-col">
               <span className="text-gray-600">{formatDate(row.original.launchDate)}</span>
               <span className="text-red-500">{formatDate(row.original.dueDate)}</span>
            </div>
         ),
         dataType: 'date',
      }),
      columnHelper.accessor('value', {
         id: 'value',
         size: 100,
         header: 'Valor',
         cell: ({ row }) => <span>{formatCurrency(row.original.value)}</span>,
         dataType: 'currency',
      }),
      columnHelper.display({
         id: 'actions',
         size: 60,
         cell: ({
            row,
            table: {
               options: { meta },
            },
         }) => (
            <div className="flex items-center justify-end">
               <div className="flex items-center">
                  {row.original.status !== 'PAID' && !(userRole === 'USER') && (
                     <Tooltip size="sm" content="Receber" placement="top" color="invert">
                        <Button
                           onClick={() => {
                              openModal({
                                 view: (
                                    <ModalForm title="Receber">
                                       <SettleAccountReceivable getAccounts={getList} account={row.original} />
                                    </ModalForm>
                                 ),
                                 size: 'sm',
                                 customSize: 'max-w-2xl',
                              });
                           }}
                           as="span"
                           className="cursor-pointer bg-white px-2 hover:bg-transparent"
                        >
                           <ActionIcon as="span" size="sm" variant="outline" aria-label="Liquidar">
                              <GiTakeMyMoney size={24} className="text-gray-500 hover:text-gray-700" />
                           </ActionIcon>
                        </Button>
                     </Tooltip>
                  )}

                  {row.original.status !== 'PAID' && !(userRole === 'USER') && (
                     <Tooltip size="sm" content="Editar" placement="top" color="invert">
                        <Button
                           onClick={() => {
                              openModal({
                                 view: (
                                    <ModalForm title="Editar documento">
                                       <EditAccountReceivable getAccounts={getList} account={row.original} />
                                    </ModalForm>
                                 ),
                                 size: 'sm',
                              });
                           }}
                           as="span"
                           className="cursor-pointer bg-white px-2 hover:bg-transparent"
                        >
                           <ActionIcon as="span" size="sm" variant="outline" aria-label="Editar">
                              <PencilIcon className="size-4 text-gray-500 hover:text-gray-700" />
                           </ActionIcon>
                        </Button>
                     </Tooltip>
                  )}

                  {row.original.status === 'PAID' && !(userRole === 'USER') && (
                     <Tooltip size="sm" content="Estornar pagamento" placement="top" color="invert">
                        <Button
                           onClick={() => {
                              openModal({
                                 view: (
                                    <ModalForm title="Estornar pagamento">
                                       <ConfirmReversePayment id={row.original.id as string} />
                                    </ModalForm>
                                 ),
                                 size: 'sm',
                              });
                           }}
                           as="span"
                           className="cursor-pointer bg-white px-2 hover:bg-transparent"
                        >
                           <ActionIcon as="span" size="sm" variant="outline" aria-label="Estornar">
                              <FiRotateCcw size={20} className="text-gray-500 hover:text-gray-700" />
                           </ActionIcon>
                        </Button>
                     </Tooltip>
                  )}

                  {!(userRole === 'USER') && (
                     <Tooltip size="sm" content="Visualizar" placement="top" color="invert">
                        <Button
                           onClick={() => {
                              openModal({
                                 view: (
                                    <ModalForm title="Informações do documento">
                                       <AccountReceivableDetails id={row.original.id as any} />
                                    </ModalForm>
                                 ),
                                 size: 'sm',
                              });
                           }}
                           as="span"
                           className="cursor-pointer bg-white px-2 hover:bg-transparent"
                        >
                           <ActionIcon as="span" size="sm" variant="outline" aria-label="Visualizar">
                              <EyeIcon className="size-4 text-gray-500 hover:text-gray-700" />
                           </ActionIcon>
                        </Button>
                     </Tooltip>
                  )}

                  {!(userRole === 'USER') && (
                     <Tooltip size="sm" content="Remover" placement="top" color="invert">
                        <TableRowActionGroup
                           isVisibleDelete={row.original.status !== 'PAID' && row.original.hasInvoiceLink === false}
                           isVisibleEdit={false}
                           isVisible={false}
                           deletePopoverTitle="Excluir conta a receber?"
                           deletePopoverDescription={`Tem certeza que deseja excluir o Documento ${row.original.documentNumber}?`}
                           onDelete={async () => {
                              await api.delete(`/accounts-receivable/${row.original.id}`);
                              getList();
                           }}
                        />
                     </Tooltip>
                  )}
               </div>
            </div>
         ),
      }),
   ];

   return columns.filter((_, index) => {
      return isMobile ? index === 0 || index === columns.length - 1 : true;
   });
};
