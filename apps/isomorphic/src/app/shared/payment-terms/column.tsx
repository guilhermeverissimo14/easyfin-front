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

const columnHelper = createColumnHelper<PaymentTermModel>();

const PaymentMethodCell = ({ paymentMethodId }: { paymentMethodId: string }) => {
  const [paymentMethod, setPaymentMethod] = useState<string>('N/A');

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      try {
        const response = await api.get<PaymentMethod[]>('/payment-methods');
        const foundMethod = response.data.find(pm => pm.id === paymentMethodId);
        setPaymentMethod(foundMethod ? foundMethod.name : 'N/A');
      } catch (error) {
        console.error('Erro ao buscar método de pagamento:', error);
      }
    };

    fetchPaymentMethod();
  }, [paymentMethodId]);

  return <span>{paymentMethod}</span>;
};

export const ListPaymentTermColumn = (getList: () => void) => {
  const { openModal } = useModal();
  const isMobile = window.innerWidth < 768;

  const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

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
      header: 'Prazo em dias',
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
      cell: ({ row }) => <PaymentMethodCell paymentMethodId={row.original.paymentMethodId} />,
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
          isVisibleDelete={!(userRole === 'USER')}
          isVisible={!(userRole === 'USER')}
          isVisibleEdit={!(userRole === 'USER')}
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