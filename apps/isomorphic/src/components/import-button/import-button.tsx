'use client';

import { useState, useEffect } from 'react';
import { Button, Input } from 'rizzui';
import { toast } from 'react-toastify';
import { api } from '@/service/api';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { PiFileCsv, PiFileXls, PiPencil, PiCheck, PiX } from 'react-icons/pi';
import { SelectField } from '@/components/input/select-field';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ParseBankTransactionsResponse, EditableBankTransaction, OptionsSelect } from '@/types';
import ImportLoadingModal from '../modal/import-loading-modal';
import { useImportLoading } from '@/components/modal/global-import-loading';

const importFormSchema = z.object({
  file: z.any().refine((file) => file instanceof File, 'Selecione um arquivo')
});

type ImportFormData = z.infer<typeof importFormSchema>;

type ImportExtractModalProps = {
  onSuccess: () => void;
};

export default function ImportExtractModal({ onSuccess }: ImportExtractModalProps) {
  const [loading, setLoading] = useState(false);
  const { showImportLoading, hideImportLoading } = useImportLoading();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParseBankTransactionsResponse | null>(null);
  const [editableTransactions, setEditableTransactions] = useState<EditableBankTransaction[]>([]);
  const [costCenters, setCostCenters] = useState<OptionsSelect[]>([]);
  const [bankAccounts, setBankAccounts] = useState<OptionsSelect[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const { closeModal, openModal } = useModal();
  
  const { handleSubmit } = useForm<ImportFormData>({
    resolver: zodResolver(importFormSchema)
  });

  useEffect(() => {
    const fetchCostCenters = async () => {
      try {
        const response = await api.get('/cost-centers');
        
        if (response?.data) {
          const centers = response.data.map((center: any) => ({
            label: center.name,
            value: center.id
          }));
          setCostCenters(centers);
        }
      } catch (error) {
        console.error('Erro ao buscar centros de custo:', error);
        toast.error('Não foi possível carregar os centros de custo');
      }
    };
    
    const fetchBankAccounts = async () => {
      try {
        const response = await api.get('/bank-accounts');
        
        if (response?.data) {
          const accounts = response.data.map((account: any) => ({
            label: `${account.bank} - Agência ${account.agency} - CC ${account.account}`,
            value: account.id
          }));
          setBankAccounts(accounts);
        }
      } catch (error) {
        console.error('Erro ao buscar contas bancárias:', error);
        toast.error('Não foi possível carregar as contas bancárias');
      }
    };
    
    fetchCostCenters();
    fetchBankAccounts();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setParsedData(null);
      setEditableTransactions([]);
    }
  };

  const parseFile = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para importar');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const response = await api.post<ParseBankTransactionsResponse>('/cash-flow/parse-bank-extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 && response.data) {
        setParsedData(response.data);
        const transactionsWithId = response.data.validTransactions.map((transaction, index) => ({
          ...transaction,
          id: `transaction-${index}`,
          costCenterId: ''
        }));
        setEditableTransactions(transactionsWithId);
        toast.success('Arquivo processado com sucesso!');
      }
    } catch (error: any) {
      console.error('Erro ao processar arquivo:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao processar arquivo';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = (id: string, field: keyof EditableBankTransaction, value: any) => {
    setEditableTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, [field]: value, isEdited: true }
          : transaction
      )
    );
  };

  const handleValueChange = (id: string, inputValue: string) => {
    setEditingValues(prev => ({ ...prev, [id]: inputValue }));
    const normalizedValue = inputValue.replace(',', '.');
    const numericValue = parseFloat(normalizedValue) || 0;
    
    updateTransaction(id, 'value', numericValue);
  };

  const getDisplayValue = (transaction: EditableBankTransaction) => {
    if (editingRow === transaction.id && editingValues[transaction.id] !== undefined) {
      return editingValues[transaction.id];
    }
    return String(transaction.value);
  };

  const startEditing = (transactionId: string, transaction: EditableBankTransaction) => {
    setEditingRow(transactionId);
    setEditingValues(prev => ({ ...prev, [transactionId]: String(transaction.value) }));
  };

  const stopEditing = () => {
    setEditingRow(null);
    setEditingValues({});
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  };

  const formatDateDisplay = (dateString: string) => {
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      stopEditing();
    }
  };

  const onSubmit = async () => {
    if (!parsedData || editableTransactions.length === 0) {
      toast.error('Nenhuma transação para importar');
      return;
    }
  
    if (!selectedBankAccountId) {
      toast.error('Selecione uma conta bancária antes de importar as transações');
      return;
    }
  
    const transactionsWithoutValue = editableTransactions.filter(
      transaction => !transaction.value
    );
  
    if (transactionsWithoutValue.length > 0) {
      toast.error('Todas as transações devem ter um valor');
      return;
    }
  
    setLoading(true);
    
    // Usar o sistema global de loading
    showImportLoading('Recalculando saldos e processando transações');
    closeModal();
  
    try {
      const transactionsToSend = editableTransactions.map(transaction => ({
        date: transaction.date,
        historic: transaction.historic,
        value: transaction.value,
        type: transaction.type,
        detailing: transaction.detailing,
        originalRow: transaction.originalRow,
        costCenterId: transaction.costCenterId
      }));
  
      const response = await api.post('/cash-flow/process-bank-transactions', {
        bankAccountId: selectedBankAccountId,
        filename: parsedData.filename,
        transactions: transactionsToSend
      });
  
      if (response.status === 200 || response.status === 201) {
        toast.success('Transações importadas com sucesso!');
        hideImportLoading();
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao processar transações:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao processar transações';
      toast.error(errorMessage);
      hideImportLoading();
      
      openModal({
        view: <ImportExtractModal onSuccess={onSuccess} />,
        customSize: '1400px'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!parsedData) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="mb-1.5 block text-sm font-medium text-gray-900">
              Arquivo do Extrato
            </label>
            
            <div className="rounded-md border-2 border-dashed border-gray-300 p-6 transition-all">
              <div className="flex flex-col items-center justify-center gap-4">
                {!selectedFile ? (
                  <>
                    <div className="flex items-center justify-center">
                      <PiFileCsv className="h-10 w-10 text-gray-400" />
                      <PiFileXls className="h-10 w-10 text-gray-400 -ml-4" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 mb-4">
                        Arraste e solte seu arquivo aqui, ou
                      </p>
                      <label htmlFor="file-upload" className="mt-2 cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-500 hover:text-primary-700 focus:outline-none">
                        <span>Selecione um arquivo</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".xlsx,.xls,.csv"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Formatos aceitos: Excel (.xlsx, .xls) ou CSV (.csv)
                    </p>
                  </>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-3 rounded-md bg-blue-50 p-3">
                      {selectedFile.name.endsWith('.csv') ? (
                        <PiFileCsv className="h-6 w-6 text-blue-500" />
                      ) : (
                        <PiFileXls className="h-6 w-6 text-green-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button 
                        type="button"
                        className="ml-auto rounded-full bg-blue-100 p-1.5 text-blue-500 hover:bg-blue-200"
                        onClick={() => setSelectedFile(null)}
                      >
                        <PiX className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <button
                      type="button" 
                      className="mt-4 text-sm text-primary-500 hover:text-primary-700"
                      onClick={() => {
                        document.getElementById('file-upload')?.click();
                      }}
                    >
                      Escolher outro arquivo
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button"
            variant="outline"
            onClick={() => closeModal()}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            type="button"
            onClick={parseFile}
            disabled={!selectedFile || loading}
            className="px-6"
          >
            {loading ? 'Processando...' : 'Processar Arquivo'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Transações Importadas</h3>
            <p className="text-sm text-gray-600">
              Arquivo: {parsedData.filename} | Total de linhas: {parsedData.totalRows} | Transações válidas: {editableTransactions.length}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setParsedData(null);
              setEditableTransactions([]);
              setSelectedFile(null);
              setSelectedBankAccountId('');
            }}
          >
            Escolher outro arquivo
          </Button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Conta Bancária *
          </label>
          <div className={`transition-all duration-200 ${
            !selectedBankAccountId ? 'ring-2 ring-red-500 ring-opacity-50 rounded-md' : ''
          }`}>
            <SelectField
              placeholder="Selecione a conta bancária para importação"
              options={bankAccounts}
              value={selectedBankAccountId}
              onChange={(value) => setSelectedBankAccountId(value)}
              className={!selectedBankAccountId ? 'border-red-300' : ''}
            />
          </div>
          {!selectedBankAccountId && (
            <p className="text-sm text-red-600 font-medium">
              ⚠️ Selecione uma conta bancária para continuar
            </p>
          )}
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Histórico
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalhamento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-72">
                  Centro de Custo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {editableTransactions.map((transaction) => (
                <tr key={transaction.id} className={transaction.isEdited ? 'bg-yellow-50' : ''}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingRow === transaction.id ? (
                      <Input
                        type="date"
                        value={formatDate(transaction.date)}
                        onChange={(e) => updateTransaction(transaction.id, 'date', formatDateDisplay(e.target.value))}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{transaction.date}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingRow === transaction.id ? (
                      <Input
                        value={transaction.historic}
                        onChange={(e) => updateTransaction(transaction.id, 'historic', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{transaction.historic}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingRow === transaction.id ? (
                      <Input
                        type="text"
                        value={getDisplayValue(transaction)}
                        onChange={(e) => handleValueChange(transaction.id, e.target.value)}
                        className="w-full"
                        placeholder="0.00"
                        onKeyDown={handleKeyDown}
                      />
                    ) : (
                      <span className={`text-sm font-medium ${
                        transaction.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'DEBIT' ? '-' : '+'}{formatCurrency(transaction.value)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {transaction.type === 'DEBIT' ? 'Débito' : 'Crédito'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editingRow === transaction.id ? (
                      <Input
                        value={transaction.detailing}
                        onChange={(e) => updateTransaction(transaction.id, 'detailing', e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{transaction.detailing}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <SelectField
                      placeholder="Selecione o centro de custo"
                      options={costCenters}
                      value={transaction.costCenterId || ''}
                      onChange={(value) => updateTransaction(transaction.id, 'costCenterId', value)}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingRow === transaction.id ? (
                      <button
                        type="button"
                        onClick={stopEditing}
                        className="text-green-500 hover:text-green-800 ml-3"
                      >
                        <PiCheck className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditing(transaction.id, transaction)}
                        className="text-blue-500 hover:text-blue-800 ml-3"
                      >
                        <PiPencil className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 fixed bottom-0 z-50 bg-white p-6 w-[95%]">
        <Button 
          type="button"
          variant="outline"
          onClick={() => closeModal()}
          disabled={loading}
        >
          Cancelar
        </Button>
        
        <Button
          type="button"
          onClick={onSubmit}
          disabled={loading || !selectedBankAccountId}
          className={`px-6 ${
            !selectedBankAccountId ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Importando...' : 'Importar Transações'}
        </Button>
      </div>
    </div>
  );
}