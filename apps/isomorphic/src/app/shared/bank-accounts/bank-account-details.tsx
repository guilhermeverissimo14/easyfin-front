'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaBuilding, FaIdCard, FaCreditCard, FaInfoCircle, FaCalendarAlt, FaEdit } from 'react-icons/fa';

import { api } from '@/service/api';
import { LoadingSpinner } from '@/components/loading-spinner';
import AvatarCard from '@core/ui/avatar-card';
import { BankAccount } from '@/types';

interface BankAccountDetailsProps {
  id: string;
}

export default function BankAccountDetails({ id }: BankAccountDetailsProps) {
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBankAccount = async () => {
      try {
        const { data } = await api.get<BankAccount>(`/bank-accounts/${id}`);
        setBankAccount(data);
      } catch (err) {
        console.error('Error fetching bank account details:', err);
        setError('Não foi possível carregar os detalhes da conta bancária.');
        toast.error('Erro ao carregar detalhes da conta bancária');
      } finally {
        setLoading(false);
      }
    };

    fetchBankAccount();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !bankAccount) {
    return <p className="text-red-500">{error || 'Conta bancária não encontrada'}</p>;
  }

  const accountTypeMap: Record<string, string> = {
    'C': 'Conta Corrente',
    'P': 'Conta Poupança',
  };

  const ListBankAccountDetails = ({ bankAccount }: { bankAccount: BankAccount }) => {
    return (
      <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
        <ul className="grid gap-4 p-5">
          <li className="flex items-center gap-2">
            <FaBuilding className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Banco:
            </span>
            <span className="text-base text-gray-700">
              {bankAccount.bank}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaIdCard className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Agência:
            </span>
            <span className="text-base text-gray-700">
              {bankAccount.agency}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaCreditCard className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Conta:
            </span>
            <span className="text-base text-gray-700">
              {bankAccount.account}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <FaInfoCircle className="text-gray-700" />
            <span className="text-base font-bold text-gray-900">
              Tipo:
            </span>
            <span className="text-base text-gray-700">
              {accountTypeMap[bankAccount.type] || '-'}
            </span>
          </li>
        </ul>

        {(bankAccount.createdAt || bankAccount.updatedAt) && (
          <div className="m-5 border-t border-gray-200 pt-4">
            <h3 className="mb-3 text-lg font-semibold">Informações adicionais</h3>
            <ul className="grid gap-4">
              {bankAccount.createdAt && (
                <li className="flex items-center gap-2">
                  <FaCalendarAlt className="text-gray-700" />
                  <span className="text-base font-bold text-gray-900">
                    Data de criação:
                  </span>
                  <span className="text-base text-gray-700">
                    {new Date(bankAccount.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </li>
              )}
              {bankAccount.updatedAt && bankAccount.updatedAt !== bankAccount.createdAt && (
                <li className="flex items-center gap-2">
                  <FaEdit className="text-gray-700" />
                  <span className="text-base font-bold text-gray-900">
                    Última atualização:
                  </span>
                  <span className="text-base text-gray-700">
                    {new Date(bankAccount.updatedAt).toLocaleDateString('pt-BR')}
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
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(bankAccount.bank)}&background=2563eb&color=ffffff`}
          name={bankAccount.bank}
          description={`${bankAccount.agency} - ${bankAccount.account}`}
        />
      </div>

      <ListBankAccountDetails bankAccount={bankAccount} />
    </main>
  );
}