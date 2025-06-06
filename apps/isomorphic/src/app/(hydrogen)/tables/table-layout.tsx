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
   columns: any;
   fileName: string;
   action?: string | null;
   icon: React.ReactNode | null;
   iconFilter?: React.ReactNode | null;
   payrollNavigation?: boolean;
   filter?: string | null;
   openModalFilter?: () => void;
} & PageHeaderTypes;

export default function TableLayout({
   openModal,
   payrollNavigation = false,
   navigation,
   title,
   data,
   columns,
   header,
   fileName,
   children,
   filter = null,
   action = null,
   icon = null,
   iconFilter = null,
   openModalFilter,
   ...props
}: React.PropsWithChildren<TableLayoutProps>) {
   return (
      <>
         <PageHeader title={title} {...props}>
            <div className="mt-4 flex items-center gap-3 @lg:mt-0">
               <ExportButton columns={columns} data={data} fileName={fileName} />
               {filter && (
                  <Button
                     as="span"
                     color="primary"
                     className="w-full cursor-pointer border-[#3772FB] hover:bg-[#3772FB]/10 @lg:w-auto"
                     variant="outline"
                     onClick={!payrollNavigation ? openModalFilter : navigation}
                  >
                     {iconFilter && iconFilter}
                     {filter}
                  </Button>
               )}
               {action && (
                  <Button as="span" className="w-full cursor-pointer @lg:w-auto" onClick={!payrollNavigation ? openModal : navigation}>
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
