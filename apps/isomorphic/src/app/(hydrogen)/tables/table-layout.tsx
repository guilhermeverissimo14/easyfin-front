'use client';

import ExportButton from '@/app/shared/export-button';
import PageHeader, { PageHeaderTypes } from '@/app/shared/page-header';
import { Button } from 'rizzui/button';

type TableLayoutProps = {
   openModal?: () => void;
   navigation?: () => void;
   title: string;
   data: unknown[];
   header: string;
   fileName: string;
   action?: string | null;
   icon: React.ReactNode | null;
   payrollNavigation?:boolean;
} & PageHeaderTypes;

export default function TableLayout({
   openModal,
   payrollNavigation = false,
   navigation,
   title,
   data,
   header,
   fileName,
   children,
   action = null,
   icon = null,
   ...props
}: React.PropsWithChildren<TableLayoutProps>) {

   return (
      <>
         <PageHeader title={title} {...props}>
            <div className="mt-4 flex items-center gap-3 @lg:mt-0">
               <ExportButton data={data} fileName={fileName} header={header} />
               {action && (
                  <Button
                     as="span"
                     className="w-full cursor-pointer @lg:w-auto"
                     onClick={!payrollNavigation ? openModal : navigation}
                  >
                     {icon && icon}
                     {action}
                  </Button>
               )}
            </div>
         </PageHeader>

         {children}
      </>
   );
}
