'use client';

import { createColumnHelper } from '@tanstack/react-table';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { AllPayrollsType} from '@/types';
import { useRouter } from 'next/navigation';
import { routes } from '@/config/routes';

const columnHelper = createColumnHelper<AllPayrollsType>();

export const ListPayrollsColumn = (getList: () => void) => {

   const isMobile = window.innerWidth < 768;
   const router = useRouter();

   const columns = [
      columnHelper.display({
         id: 'name',
         size: 160,
         header: 'Colaborador',
         cell: ({ row }) => (
           <span>{row.original.colaborator}</span>
         ),
         enableGlobalFilter: true,
       }),
      
      columnHelper.display({
         id: 'reference', 
         size: 160,
         header: 'Referência',
         cell: ({ row }) => `${String(row.original.month).padStart(2, '0')}/${row.original.year}`,
      }),
      

      columnHelper.display({
         id: 'isClosed',
         size: 160,
         header: 'Status',
         cell: ({ row }) => (
           <span
             className={`rounded-full px-2 py-1 text-white ${
               row.original.isClosed ? 'bg-green-500' : 'bg-red-500'
             }`}
           >
             {row.original.isClosed ? 'Finalizada' : 'Não finalizada'}
           </span>
         ),
       }),
      columnHelper.display({
         id: 'actions',
         size: 160,
         cell: ({
            row,
            table: {
               options: { meta },
            },
         }) => (
            <TableRowActionGroup
               copySheet={row.original.isClosed}
               navigationCopySheet={() => router.push(routes.financial.payrollsClone(row.original.id))}
               editPayroll={row.original.isClosed == false}
               navigationEdit={() => router.push(routes.financial.payrollsEdit(row.original.id))}
               isVisibleDelete={false}
               isVisible={false}
               isVisibleEdit={row.original.isClosed == false}
            />
         ),
      }),
   ];

   return columns.filter((_, index) => {
      return isMobile ? index === 0 || index === columns.length - 1 : true;
   });
};
