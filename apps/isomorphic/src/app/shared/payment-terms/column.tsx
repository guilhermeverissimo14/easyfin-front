'use client';

import { useEffect, useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { api } from '@/service/api';
import { PaymentMethod, PaymentTermModel } from '@/types';
import ModalForm from '@/components/modal/modal-form';
import PaymentTermsDetails from './payment-terms-details';
import { EditPaymentTerm } from './edit-payment-terms';
import { CreatePaymentTerm } from './create-payment-terms';

const columnHelper = createColumnHelper<PaymentTermModel>();

export const ListPaymentTermColumn = (getList: () => void) => {
  const { openModal } = useModal();
  const isMobile = window.innerWidth < 768;
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Buscar métodos de pagamento para exibir seus nomes
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await api.get<PaymentMethod[]>('/payment-methods');
        setPaymentMethods(response.data);
      } catch (error) {
        console.error('Erro ao buscar métodos de pagamento:', error);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Função para obter nome do método de pagamento pelo ID
  const getPaymentMethodName = (id: string) => {
    const method = paymentMethods.find(m => m.id === id);
    return method?.name || 'Não especificado';
  };

  // Função para formatar a condição de pagamento
  const formatCondition = (condition: string) => {
    return condition.split(',').join(', ') + ' dias';
  };

  const columns = [
    columnHelper.accessor('description', {
      id: 'description',
      size: 200,
      header: 'Descrição',
      cell: ({ row }) => <span className="font-medium">{row.original.description}</span>,
    }),
    columnHelper.accessor('condition', {
      id: 'condition',
      size: 150,
      header: 'Condição (dias)',
      cell: ({ row }) => <span>{formatCondition(row.original.condition)}</span>,
    }),
    columnHelper.accessor('installments', {
      id: 'installments',
      size: 120,
      header: 'Parcelas',
      cell: ({ row }) => <span>{row.original.installments}</span>,
    }),
    columnHelper.accessor('paymentMethodId', {
      id: 'paymentMethod',
      size: 180,
      header: 'Método de Pagamento',
      cell: ({ row }) => <span>{getPaymentMethodName(row.original.paymentMethodId)}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      size: 120,
      cell: ({
        row,
        table: {
          options: { meta },
        },
      }) => (
        <TableRowActionGroup
          isVisibleDelete={true}
          isVisible={true}
          isVisibleEdit={true}
          openModalList={() =>
            openModal({
              view: (
                <ModalForm title="Detalhes da Condição de Pagamento">
                  <PaymentTermsDetails id={row.original.id} />
                </ModalForm>
              ),
              size: 'md',
            })
          }
          openModalEdit={() =>
            openModal({
              view: (
                <ModalForm title="Editar Condição de Pagamento">
                  <EditPaymentTerm id={row.original.id} getPaymentTerms={getList} />
                </ModalForm>
              ),
              size: 'md',
            })
          }
          deletePopoverTitle="Excluir Condição de Pagamento"
          deletePopoverDescription={`Tem certeza que deseja excluir a condição "${row.original.description}"?`}
          onDelete={async () => {
            await api.delete(`/payment-terms/${row.original.id}`);
            getList();
          }}
        />
      ),
    }),
  ];

  return columns.filter((_, index) => {
    return isMobile ? index === 0 || index === columns.length - 1 : true;
  });
};