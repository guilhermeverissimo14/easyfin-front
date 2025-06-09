'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from 'rizzui';
import { toast } from 'react-toastify';
import { api } from '@/service/api';

type ImportExtractModalProps = {
  bankAccountId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function ImportExtractModal({
  bankAccountId,
  onSuccess,
  onCancel
}: ImportExtractModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankDetails, setBankDetails] = useState<{ bank: string, agency: string, account: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch bank account details
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await api.get(`/bank-accounts/${bankAccountId}`);
        if (response?.data) {
          setBankDetails({
            bank: response.data.bank,
            agency: response.data.agency,
            account: response.data.account
          });
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do banco:', error);
      }
    };

    if (bankAccountId) {
      fetchBankDetails();
    }
  }, [bankAccountId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para importar');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('bankAccountId', bankAccountId);
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/cash-flow/import-bank-extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success('Extrato bancário importado com sucesso!');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Erro ao importar extrato:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao importar extrato bancário';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bank Account Details Section */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 font-medium text-gray-700">Conta Bancária Selecionada</h3>
        
        {bankDetails ? (
          <div className="space-y-1">
            <p className="text-base font-semibold">{bankDetails.bank}</p>
            <p className="text-sm text-gray-600">
              Agência: {bankDetails.agency} - Conta: {bankDetails.account}
            </p>
          </div>
        ) : (
          <div className="animate-pulse h-6 bg-gray-200 rounded w-2/3"></div>
        )}
      </div>

      {/* File Upload Section */}
      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Arquivo do Extrato
          </label>
          
          <div className="flex items-center">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
          </div>
          
          <p className="mt-1 text-xs text-gray-500">
            Formatos aceitos: Excel (.xlsx, .xls) ou CSV (.csv)
          </p>
        </div>
        
        {selectedFile && (
          <div className="rounded-md bg-blue-50 p-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        
        <Button
          type="button"
          onClick={handleImport}
          disabled={!selectedFile || loading}
          className="px-6"
        >
          {loading ? 'Importando...' : 'Confirmar Importação'}
        </Button>
      </div>
    </div>
  );
}