'use client';

import React from 'react';
import { Title, ActionIcon } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import { useModal } from '@/app/shared/modal-views/use-modal';

interface ModalFormProps {
   title: string;
   width?: boolean;
   customWidth?: string;
   children: React.ReactNode;
}

export default function ModalForm({ title, width = false, customWidth, children }: ModalFormProps) {
   const { closeModal } = useModal();

   let modalWidthClass = '';
   
   if (customWidth) {
      modalWidthClass = customWidth;
   } else {
      modalWidthClass = width ? 'md:min-w-[1024px] lg:min-w-[1200px]' : 'md:min-w-[600px] lg:min-w-[800px]';
   }

   return (
      <div className={`m-auto w-full bg-white px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7 ${modalWidthClass}`}>
         <div className="rounded-m mb-7 flex items-center justify-between">
            <Title as="h4" className="font-semibold">
               {title}
            </Title>
            <ActionIcon size="sm" variant="text" onClick={() => closeModal()}>
               <PiXBold className="h-auto w-5" />
            </ActionIcon>
         </div>
         <div className="max-h-[85vh] md:max-h-[85vh] overflow-hidden overflow-y-auto pr-4">{children}</div>
      </div>
   );
}
