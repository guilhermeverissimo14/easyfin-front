'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaFolder, FaCalendarAlt, FaEdit } from 'react-icons/fa';
import { PiGridFourDuotone } from 'react-icons/pi';

import { api } from '@/service/api';
import { LoadingSpinner } from '@/components/loading-spinner';
import AvatarCard from '@core/ui/avatar-card';
import { constCentersModel } from '@/types';

interface CostCenterDetailsProps {
  id: string;
}

export const CostCenterDetails = ({ id }: CostCenterDetailsProps) => {
  const [costCenter, setCostCenter] = useState<constCentersModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCostCenter = async () => {
      try {
        const { data } = await api.get<constCentersModel>(`/cost-centers/${id}`);
        setCostCenter(data);
      } catch (err) {
        console.error('Error fetching cost center details:', err);
        setError('Não foi possível carregar os detalhes do centro de custo.');
        toast.error('Erro ao carregar detalhes do centro de custo');
      } finally {
        setLoading(false);
      }
    };

    fetchCostCenter();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !costCenter) {
    return <p className="text-red-500">{error || 'Centro de custo não encontrado'}</p>;
  }

  const ListCostCenterDetails = ({ costCenter }: { costCenter: constCentersModel }) => {
    return (
      <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <ul className="grid gap-4 p-5">
          <li className="flex items-center gap-2">
            <FaFolder className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Nome:
            </span>
            <span className="text-base text-gray-700">
              {costCenter.name}
            </span>
          </li>
        </ul>

        {(costCenter.createdAt || costCenter.updatedAt) && (
          <div className="m-5 border-t border-gray-200 pt-4">
            <h3 className="mb-3 text-lg font-semibold">Informações adicionais</h3>
            <ul className="grid gap-4">
              {costCenter.createdAt && (
                <li className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-700" />
                  <span className="text-base font-bold text-gray-900">
                    Data de criação:
                  </span>
                  <span className="text-base text-gray-700">
                    {new Date(costCenter.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </li>
              )}
              {costCenter.updatedAt && costCenter.updatedAt !== costCenter.createdAt && (
                <li className="flex items-center gap-2">
                  <FaEdit className="text-gray-700" />
                  <span className="text-base font-bold text-gray-900">
                    Última atualização:
                  </span>
                  <span className="text-base text-gray-700">
                    {new Date(costCenter.updatedAt).toLocaleDateString('pt-BR')}
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
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(costCenter.name)}&background=2563eb&color=ffffff`}
          name={costCenter.name}
          description="Centro de Custo"
        />
      </div>

      <ListCostCenterDetails costCenter={costCenter} />
    </main>
  );
};

export default CostCenterDetails;