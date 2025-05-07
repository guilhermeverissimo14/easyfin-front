'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaBuilding, FaIdCard, FaEnvelope, FaPhone, FaUser, FaMapMarkerAlt, FaMapPin } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';

import { api } from '@/service/api';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import AvatarCard from '@core/ui/avatar-card';
import { cpfCnpjMask, phoneNumberMask } from '@/utils/format';
import { CustomerType } from '@/types';
import { LoadingSpinner } from '@/components/loading-spinner';

interface CustomerDetailsProps {
  id: string;
}

export default function CustomerDetails({ id }: CustomerDetailsProps) {
  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { data } = await api.get<CustomerType>(`/customers/${id}`);
        setCustomer(data);
      } catch (err) {
        console.error('Error fetching customer details:', err);
        setError('Não foi possível carregar os detalhes do cliente.');
        toast.error('Erro ao carregar detalhes do cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !customer) {
    return <p className="text-red-500">{error || 'Cliente não encontrado'}</p>;
  }

  const ListCustomerDetails = ({ customer }: { customer: CustomerType }) => {
    return (
      <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <ul className="grid gap-4 p-5">
          <li className="flex items-center gap-2">
            <FaIdCard className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              CNPJ:
            </span>
            <span className="text-base text-gray-700">
              {cpfCnpjMask(customer.cnpj)}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaEnvelope className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              E-mail:
            </span>
            <span className="text-base text-gray-700">
              {customer.email || 'Não informado'}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaPhone className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Telefone:
            </span>
            <span className="text-base text-gray-700">
              {customer.phone ? phoneNumberMask(customer.phone) : 'Não informado'}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaUser className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Contato:
            </span>
            <span className="text-base text-gray-700">
              {customer.contact || 'Não informado'}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <MdAttachMoney className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Retenção de ISS:
            </span>
            <span className="text-base text-gray-700">
              {customer.retIss ? 'Sim' : 'Não'}
            </span>
          </li>
        </ul>

        <div className="m-5 border-t border-gray-200 pt-4">
          <h3 className="mb-3 text-lg font-semibold">Endereço</h3>
          <ul className="grid gap-4">
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-700" />
              <span className="text-base font-bold text-gray-900">
                Endereço Completo:
              </span>
              <span className="text-base text-gray-700">
                {customer.address || 'Não informado'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <FaMapPin className="text-gray-700" />
              <span className="text-base font-bold text-gray-900">
                CEP:
              </span>
              <span className="text-base text-gray-700">
                {customer.zipCode || 'Não informado'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <FaBuilding className="text-gray-700" />
              <span className="text-base font-bold text-gray-900">
                Cidade/Estado:
              </span>
              <span className="text-base text-gray-700">
                {customer.city ? `${customer.city}/${customer.state || ''}` : 'Não informado'}
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <main>
      <div className="mb-4 flex flex-row items-center justify-between">
        <AvatarCard
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=2563eb&color=ffffff`}
          name={customer.name}
          description="Cliente"
        />
        <div className="w-24">
          {getStatusBadge(customer.active, customer.active ? "Ativo" : "Inativo")}
        </div>
      </div>

      <ListCustomerDetails customer={customer} />
    </main>
  );
}