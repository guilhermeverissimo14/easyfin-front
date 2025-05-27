'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaFileContract, FaCalendarDay, FaRegCreditCard, FaCalendarAlt, FaEdit, FaLayerGroup } from 'react-icons/fa';

import { api } from '@/service/api';
import { LoadingSpinner } from '@/components/loading-spinner';
import AvatarCard from '@core/ui/avatar-card';
import { PaymentMethod, PaymentTermModel } from '@/types';

interface PaymentTermsDetailsProps {
  id: string;
}

export default function PaymentTermsDetails({ id }: PaymentTermsDetailsProps) {
  const [paymentTerm, setPaymentTerm] = useState<PaymentTermModel | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMethod, setLoadingMethod] = useState(false);
  const [error, setError] = useState<string | null>(null);
    
  useEffect(() => {
    const fetchPaymentTerm = async () => {
      try {
        const { data } = await api.get<PaymentTermModel>(`/payment-terms/${id}`);
        setPaymentTerm(data);
        
        if (data.paymentMethodId) {
          setLoadingMethod(true);
          try {
            const methodResponse = await api.get<PaymentMethod[]>(`/payment-methods`);
            const methodFilter = methodResponse.data.find(pm => pm.id === data.paymentMethodId);
            setPaymentMethod(methodFilter || null);
          } catch (methodErr) {
            console.error('Error fetching payment method:', methodErr);
          } finally {
            setLoadingMethod(false);
          }
        }
      } catch (err) {
        console.error('Error fetching payment term details:', err);
        setError('Não foi possível carregar os detalhes da condição de pagamento.');
        toast.error('Erro ao carregar detalhes da condição de pagamento');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentTerm();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !paymentTerm) {
    return <p className="text-red-500">{error || 'Condição de pagamento não encontrada'}</p>;
  }

  const formatCondition = (condition: string) => {
    return condition.split(',').join(', ') + ' dias';
  };

  const ListPaymentTermDetails = ({ paymentTerm }: { paymentTerm: PaymentTermModel }) => {
    return (
      <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <ul className="grid gap-4 p-5">
          <li className="flex items-center gap-2">
            <FaFileContract className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Descrição:
            </span>
            <span className="text-base text-gray-700">
              {paymentTerm.description}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaCalendarDay className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Condição:
            </span>
            <span className="text-base text-gray-700">
              {formatCondition(paymentTerm.condition)}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaLayerGroup className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Parcelas:
            </span>
            <span className="text-base text-gray-700">
              {paymentTerm.installments}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaRegCreditCard className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Método de Pagamento:
            </span>
            {loadingMethod ? (
              <span className="text-base text-gray-500">Carregando...</span>
            ) : (
              <span className="text-base text-gray-700">
                {paymentMethod?.name || 'Não encontrado'}
              </span>
            )}
          </li>
        </ul>

        {(paymentTerm.createdAt || paymentTerm.updatedAt) && (
          <div className="m-5 border-t border-gray-200 pt-4">
            <h3 className="mb-3 text-lg font-semibold">Informações adicionais</h3>
            <ul className="grid gap-4">
              {paymentTerm.createdAt && (
                <li className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-700" />
                  <span className="text-base font-bold text-gray-900">
                    Data de criação:
                  </span>
                  <span className="text-base text-gray-700">
                    {new Date(paymentTerm.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </li>
              )}
              {paymentTerm.updatedAt && paymentTerm.updatedAt !== paymentTerm.createdAt && (
                <li className="flex items-center gap-2">
                  <FaEdit className="text-gray-700" />
                  <span className="text-base font-bold text-gray-900">
                    Última atualização:
                  </span>
                  <span className="text-base text-gray-700">
                    {new Date(paymentTerm.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <main>
      <div className="mb-4 flex flex-row items-center justify-between">
        <AvatarCard
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(paymentTerm.description)}&background=2563eb&color=ffffff`}
          name={paymentTerm.description}
          description={`${paymentTerm.installments} ${paymentTerm.installments === 1 ? 'parcela' : 'parcelas'}`}
        />
      </div>

      <ListPaymentTermDetails paymentTerm={paymentTerm} />
    </main>
  );
}