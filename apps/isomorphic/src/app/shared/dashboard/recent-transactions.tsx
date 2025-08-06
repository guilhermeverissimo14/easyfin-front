'use client';

import { useState } from 'react';
import WidgetCard from '@core/components/cards/widget-card';
import { Avatar, Text, Badge, Button } from 'rizzui';
import useApi from '@/hooks/useApi';
import cn from '@core/utils/class-names';
import { formatDate, formatCurrency } from '@/utils/format';
import { PiArrowUp, PiArrowDown, PiClock, PiEye, PiCaretRight } from 'react-icons/pi';

interface Transaction {
  id: string;
  type: 'receivable' | 'payable' | 'cash-flow';
  description: string;
  value: number;
  date: string;
  status: 'PENDING' | 'PAID' | 'Entrada' | 'Saída';
  customerName?: string;
  supplierName?: string;
  documentNumber?: string;
}

// Internal interface for display
interface DisplayTransaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  category: string;
  status: 'completed' | 'pending' | 'cancelled';
  customerName?: string;
  supplierName?: string;
}

interface RecentTransactionsData {
  transactions: Transaction[];
  totalTransactions: number;
  pendingCount: number;
}

export default function RecentTransactions({ className }: { className?: string }) {
  const { data: transactions, loading, error } = useApi<Transaction[]>('/dashboard/recent-transactions');
  const [showAll, setShowAll] = useState(false);

  // Mock data for demonstration
  const mockData: Transaction[] = [
    {
      id: '1',
      type: 'receivable',
      description: 'Conta a Receber - João Silva',
      value: 15000,
      date: '2024-01-15T10:00:00.000Z',
      status: 'PAID',
      customerName: 'João Silva',
      documentNumber: '001'
    },
    {
      id: '2',
      type: 'payable',
      description: 'Conta a Pagar - Fornecedor ABC',
      value: 8500,
      date: '2024-01-14T10:00:00.000Z',
      status: 'PAID',
      supplierName: 'Fornecedor ABC Ltda',
      documentNumber: '002'
    },
    {
      id: '3',
      type: 'receivable',
      description: 'Conta a Receber - Maria Santos',
      value: 12000,
      date: '2024-01-13T10:00:00.000Z',
      status: 'PENDING',
      customerName: 'Maria Santos',
      documentNumber: '003'
    },
    {
      id: '4',
      type: 'payable',
      description: 'Conta a Pagar - Distribuidora XYZ',
      value: 6800,
      date: '2024-01-12T10:00:00.000Z',
      status: 'PAID',
      supplierName: 'Distribuidora XYZ',
      documentNumber: '004'
    },
    {
      id: '5',
      type: 'cash-flow',
      description: 'Recebimento de conta a receber',
      value: 22000,
      date: '2024-01-11T10:00:00.000Z',
      status: 'Entrada'
    },
    {
      id: '6',
      type: 'cash-flow',
      description: 'Liquidação de conta a pagar',
      value: 3500,
      date: '2024-01-10T10:00:00.000Z',
      status: 'Saída'
    }
  ];

  // Transform API data to display format
  const transformToDisplayData = (apiData: Transaction[]): DisplayTransaction[] => {
    return apiData.map(transaction => {
      let displayType: 'income' | 'expense';
      let category: string;
      let displayStatus: 'completed' | 'pending' | 'cancelled';

      // Map type
      if (transaction.type === 'receivable' || (transaction.type === 'cash-flow' && transaction.status === 'Entrada')) {
        displayType = 'income';
      } else {
        displayType = 'expense';
      }

      // Map category
      if (transaction.type === 'receivable') {
        category = 'Contas a Receber';
      } else if (transaction.type === 'payable') {
        category = 'Contas a Pagar';
      } else {
        category = 'Fluxo de Caixa';
      }

      // Map status
      if (transaction.status === 'PAID' || transaction.status === 'Entrada' || transaction.status === 'Saída') {
        displayStatus = 'completed';
      } else if (transaction.status === 'PENDING') {
        displayStatus = 'pending';
      } else {
        displayStatus = 'cancelled';
      }

      return {
        id: transaction.id,
        type: displayType,
        description: transaction.description,
        amount: transaction.value,
        date: transaction.date,
        category,
        status: displayStatus,
        customerName: transaction.customerName,
        supplierName: transaction.supplierName
      };
    });
  };

  const rawData = transactions || mockData;
  const displayData = transformToDisplayData(rawData);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'success' as const, label: 'Concluído' },
      pending: { color: 'warning' as const, label: 'Pendente' },
      cancelled: { color: 'danger' as const, label: 'Cancelado' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant="flat" color={config.color} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
        <PiArrowUp className="h-4 w-4 text-green-600" />
      </div>
    ) : (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
        <PiArrowDown className="h-4 w-4 text-red-600" />
      </div>
    );
  };

  const displayedTransactions = showAll 
    ? displayData
    : displayData.slice(0, 5);

  if (loading) {
    return (
      <WidgetCard
        title="Transações Recentes"
        titleClassName="text-gray-700 font-bold font-inter"
        className={cn('min-h-[28rem]', className)}
      >
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 rounded bg-gray-200"></div>
                  <div className="mt-1 h-3 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="h-6 w-20 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </WidgetCard>
    );
  }

  if (error) {
    return (
      <WidgetCard
        title="Transações Recentes"
        titleClassName="text-gray-700 font-bold font-inter"
        className={cn('min-h-[28rem]', className)}
      >
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <Text className="text-red-600">Erro ao carregar transações: {error}</Text>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard
      title="Transações Recentes"
      titleClassName="text-gray-700 font-bold font-inter"
      headerClassName="items-center"
      className={cn('min-h-[28rem]', className)}
      action={
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-orange-600">
            <PiClock className="h-4 w-4" />
            <span className="text-sm font-medium">
              {rawData.filter(t => t.status === 'PENDING').length} pendentes
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            onClick={() => setShowAll(!showAll)}
          >
            <PiEye className="h-4 w-4" />
            {showAll ? 'Ver menos' : 'Ver todas'}
          </Button>
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-4 @lg:grid-cols-3">
        <div className="rounded-lg bg-blue-50 p-3">
          <Text className="text-sm text-blue-600">Total de Transações</Text>
          <Text className="font-semibold text-blue-900">
            {displayData.length}
          </Text>
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <Text className="text-sm text-green-600">Receitas</Text>
          <Text className="font-semibold text-green-900">
            {rawData.filter(t => t.type === 'receivable' || (t.type === 'cash-flow' && t.status === 'Entrada')).length}
          </Text>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <Text className="text-sm text-red-600">Despesas</Text>
          <Text className="font-semibold text-red-900">
            {rawData.filter(t => t.type === 'payable' || (t.type === 'cash-flow' && t.status === 'Saída')).length}
          </Text>
        </div>
      </div>

      <div className="space-y-3">
        {displayedTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              {getTransactionIcon(transaction.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Text className="font-medium text-gray-900">
                    {transaction.description}
                  </Text>
                  <Badge variant="flat" className="text-xs bg-gray-100 text-gray-600">
                    {transaction.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatDate(transaction.date)}</span>
                  {transaction.customerName && (
                    <>
                      <span>•</span>
                      <span>Cliente: {transaction.customerName}</span>
                    </>
                  )}
                  {transaction.supplierName && (
                    <>
                      <span>•</span>
                      <span>Fornecedor: {transaction.supplierName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <Text
                  className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </Text>
                <div className="mt-1">
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
              <PiCaretRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {displayData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8">
          <PiClock className="h-12 w-12 text-gray-300" />
          <Text className="mt-2 text-gray-500">Nenhuma transação encontrada</Text>
        </div>
      )}

      {displayData.length > 5 && !showAll && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="w-full"
          >
            Ver mais {displayData.length - 5} transações
            <PiCaretRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </WidgetCard>
  );
}