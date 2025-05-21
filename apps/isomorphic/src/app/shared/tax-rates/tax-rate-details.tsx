'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaCalendarDay, FaPercentage } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';

import { api } from '@/service/api';
import { LoadingSpinner } from '@/components/loading-spinner';
import AvatarCard from '@core/ui/avatar-card';
import { TaxRateModel } from '@/types';

interface TaxRateDetailsProps {
  id: string;
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function TaxRateDetails({ id }: TaxRateDetailsProps) {
  const [taxRate, setTaxRate] = useState<TaxRateModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaxRate = async () => {
      try {
        const { data } = await api.get<TaxRateModel>(`/tax-rates/${id}`);
        setTaxRate(data);
      } catch (err) {
        console.error('Error fetching tax rate details:', err);
        setError('Não foi possível carregar os detalhes da alíquota.');
        toast.error('Erro ao carregar detalhes da alíquota');
      } finally {
        setLoading(false);
      }
    };

    fetchTaxRate();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !taxRate) {
    return <p className="text-red-500">{error || 'Alíquota não encontrada'}</p>;
  }

  const formatPercentage = (value: number) => {
    return value.toFixed(2).replace('.', ',') + '%';
  };

  const ListTaxRateDetails = ({ taxRate }: { taxRate: TaxRateModel }) => {
    return (
      <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <ul className="grid gap-4 p-5">
          <li className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Ano:
            </span>
            <span className="text-base text-gray-700">
              {taxRate.year}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaCalendarDay className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Mês:
            </span>
            <span className="text-base text-gray-700">
              {monthNames[taxRate.month - 1] || '-'}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaPercentage className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Alíquota ISSQN:
            </span>
            <span className="text-base text-gray-700">
              {formatPercentage(taxRate.issqnTaxRate)}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <MdAttachMoney className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Alíquota Efetiva:
            </span>
            <span className="text-base text-gray-700">
              {formatPercentage(taxRate.effectiveTaxRate)}
            </span>
          </li>
        </ul>

        {taxRate.createdAt && (
          <div className="m-5 border-t border-gray-200 pt-4">
            <h3 className="mb-3 text-lg font-semibold">Informações adicionais</h3>
            <ul className="grid gap-4">
              <li className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900">
                  Data de criação:
                </span>
                <span className="text-base text-gray-700">
                  {new Date(taxRate.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </li>
              {taxRate.updatedAt && taxRate.updatedAt !== taxRate.createdAt && (
                <li className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-900">
                    Última atualização:
                  </span>
                  <span className="text-base text-gray-700">
                    {new Date(taxRate.updatedAt).toLocaleDateString('pt-BR')}
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
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(`${monthNames[taxRate.month - 1]}-${taxRate.year}`)}&background=2563eb&color=ffffff`}
          name={`${monthNames[taxRate.month - 1]} de ${taxRate.year}`}
          description="Alíquotas"
        />
      </div>

      <ListTaxRateDetails taxRate={taxRate} />
    </main>
  );
}