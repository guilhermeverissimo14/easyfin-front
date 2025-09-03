'use client';

import { useEffect, useState } from 'react';
import { PiSpinner, PiFileArrowUp } from 'react-icons/pi';

interface ImportLoadingModalProps {
  isOpen: boolean;
  message?: string;
}

export default function ImportLoadingModal({ 
  isOpen, 
  message = "Processando importação..." 
}: ImportLoadingModalProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm" 
        onClick={(e) => e.preventDefault()}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
        <div className="text-center">
          <div className="mb-6">
            <div className="relative inline-flex">
              <PiFileArrowUp className="h-20 w-20 text-blue-500 mb-2" />
              <PiSpinner className="h-8 w-8 text-blue-500 absolute -top-2 -right-2 animate-spin" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Importando Transações
          </h3>
          
          <p className="text-gray-600 mb-6 text-base">
            {message}{dots}
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full animate-pulse transition-all duration-1000" style={{ width: '75%' }}></div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-amber-800">
                  Processo em andamento
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Este processo pode levar alguns minutos.
                  <br />
                  Por favor, não feche esta janela ou navegador.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}