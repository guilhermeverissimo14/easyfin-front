'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaFileContract, FaCalendarDay, FaPercentage, FaCalendarAlt, FaEdit } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';

import { api } from '@/service/api';
import { LoadingSpinner } from '@/components/loading-spinner';
import AvatarCard from '@core/ui/avatar-card';
import { PaymentTermModel } from '@/types';

interface PaymentTermsDetailsProps {
  id: string;
}

export default function PaymentTermsDetails({ id }: PaymentTermsDetailsProps) {
  const [paymentTerm, setPaymentTerm] = useState<PaymentTermModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentTerm = async () => {
      try {
        const { data } = await api.get<PaymentTermModel>(`/payment-terms/${id}`);
        setPaymentTerm(data);
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

  const formatPercentage = (value: number) => {
    return value.toFixed(2).replace('.', ',') + '%';
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
              Prazo:
            </span>
            <span className="text-base text-gray-700">
              {paymentTerm.term} {paymentTerm.term === 1 ? 'dia' : 'dias'}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaPercentage className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Taxa:
            </span>
            <span className="text-base text-gray-700">
              {formatPercentage(paymentTerm.tax)}
            </span>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <main>
      <div className="mb-4 flex flex-row items-center justify-between">
        <AvatarCard
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(paymentTerm.description)}&background=2563eb&color=ffffff`}
          name={paymentTerm.description}
          description={`${paymentTerm.term} ${paymentTerm.term === 1 ? 'dia' : 'dias'}`}
        />
      </div>

      <ListPaymentTermDetails paymentTerm={paymentTerm} />
    </main>
  );
}