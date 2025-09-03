'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import ImportLoadingModal from './import-loading-modal';

interface ImportLoadingContextType {
  showImportLoading: (message?: string) => void;
  hideImportLoading: () => void;
  isLoading: boolean;
}

const ImportLoadingContext = createContext<ImportLoadingContextType | undefined>(undefined);

export function ImportLoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('Processando importação...');

  const showImportLoading = (msg?: string) => {
    if (msg) setMessage(msg);
    setIsLoading(true);
  };

  const hideImportLoading = () => {
    setIsLoading(false);
  };

  return (
    <ImportLoadingContext.Provider value={{ showImportLoading, hideImportLoading, isLoading }}>
      {children}
      <ImportLoadingModal isOpen={isLoading} message={message} />
    </ImportLoadingContext.Provider>
  );
}

export function useImportLoading() {
  const context = useContext(ImportLoadingContext);
  if (context === undefined) {
    throw new Error('useImportLoading must be used within an ImportLoadingProvider');
  }
  return context;
}