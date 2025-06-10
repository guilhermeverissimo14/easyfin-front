'use client';

import { useState, useEffect } from 'react';
import { Button, Text } from 'rizzui';
import { toast } from 'react-toastify';
import { api } from '@/service/api';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { PiFileCsv, PiFileXls } from 'react-icons/pi';
import { SelectField } from '@/components/input/select-field';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const importFormSchema = z.object({
  bankAccountId: z.string().nonempty('Selecione uma conta bancária')
});

type ImportFormData = z.infer<typeof importFormSchema>;

type ImportExtractModalProps = {
  onSuccess: () => void;
};

export default function ImportExtractModal({
  onSuccess
}: ImportExtractModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankAccounts, setBankAccounts] = useState<{ label: string; value: string }[]>([]);
  const { closeModal } = useModal();
  
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ImportFormData>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      bankAccountId: ''
    }
  });

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        const response = await api.get('/bank-accounts');
        
        if (response?.data) {
          const accounts = response.data.map((bank: any) => ({
            label: `${bank.bank} - Agência ${bank.agency} - CC ${bank.account}`,
            value: bank.id
          }));
          setBankAccounts(accounts);
        }
      } catch (error) {
        console.error('Erro ao buscar contas bancárias:', error);
        toast.error('Não foi possível carregar as contas bancárias');
      }
    };
    
    fetchBankAccounts();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const onSubmit = async (formData: ImportFormData) => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para importar');
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('bankAccountId', formData.bankAccountId);
    formDataToSend.append('file', selectedFile);

    try {
      const response = await api.post('/cash-flow/import-bank-extract', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        toast.success('Extrato bancário importado com sucesso!');
        onSuccess();
        closeModal();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
      <div className="space-y-4">
        <Controller
          control={control}
          name="bankAccountId"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Conta Bancária"
              placeholder="Selecione a conta bancária"
              options={bankAccounts}
              onChange={onChange}
              value={value}
              error={errors.bankAccountId?.message}
            />
          )}
        />
      </div>

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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
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
          type="submit"
          disabled={!selectedFile || loading}
          className="px-6"
        >
          {loading ? 'Importando...' : 'Confirmar'}
        </Button>
      </div>
    </form>
  );
}