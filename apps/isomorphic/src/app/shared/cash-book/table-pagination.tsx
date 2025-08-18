'use client';

import { Button, Select, Text } from 'rizzui';
import { 
   PiCaretLeftBold, 
   PiCaretRightBold,
   PiCaretDoubleLeftBold,
   PiCaretDoubleRightBold
} from 'react-icons/pi';

interface PaginationInfo {
   page: number;
   limit: number;
   totalCount: number;
   totalPages: number;
   hasNextPage: boolean;
   hasPreviousPage: boolean;
}

interface TablePaginationProps {
   pagination: PaginationInfo;
   onPageChange: (page: number) => void;
   onLimitChange?: (limit: number) => void;
   className?: string;
}

const ITEMS_PER_PAGE_OPTIONS = [
   { label: '10 por página', value: '10' },
   { label: '20 por página', value: '20' },
   { label: '50 por página', value: '50' },
   { label: '100 por página', value: '100' },
];

export const TablePagination = ({ 
   pagination, 
   onPageChange, 
   onLimitChange,
   className = ''
}: TablePaginationProps) => {
   const { page, limit, totalCount, totalPages, hasNextPage, hasPreviousPage } = pagination;

   const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
         onPageChange(newPage);
      }
   };

   const handleLimitChange = (value: string) => {
      if (onLimitChange) {
         onLimitChange(parseInt(value, 10));
      }
   };

   const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
         let i = Math.max(2, page - delta);
         i <= Math.min(totalPages - 1, page + delta);
         i++
      ) {
         range.push(i);
      }

      if (page - delta > 2) {
         rangeWithDots.push(1, '...');
      } else {
         rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (page + delta < totalPages - 1) {
         rangeWithDots.push('...', totalPages);
      } else {
         rangeWithDots.push(totalPages);
      }

      return rangeWithDots.filter((v, i, arr) => arr.indexOf(v) === i);
   };

   if (totalPages === 0) {
      return (
         <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-white border-t border-gray-200 ${className}`}>
            <Text className="text-sm text-gray-700">Nenhum resultado encontrado</Text>
         </div>
      );
   }

   return (
      <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 py-3 bg-white border-t border-gray-200 ${className}`}>
         {/* Mobile pagination controls */}
         <div className="flex flex-1 justify-between sm:hidden">
            <Button
               variant="outline"
               disabled={!hasPreviousPage}
               onClick={() => handlePageChange(page - 1)}
               size="sm"
            >
               Anterior
            </Button>
            <Text className="text-sm text-gray-700 self-center">
               Página {page} de {totalPages}
            </Text>
            <Button
               variant="outline"
               disabled={!hasNextPage}
               onClick={() => handlePageChange(page + 1)}
               size="sm"
            >
               Próximo
            </Button>
         </div>
         
         {/* Desktop view */}
         <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
               <Text className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{Math.min((page - 1) * limit + 1, totalCount)}</span>
                  {' '}até{' '}
                  <span className="font-medium">{Math.min(page * limit, totalCount)}</span>
                  {' '}de{' '}
                  <span className="font-medium">{totalCount}</span>
                  {' '}resultados
               </Text>
               
               {/* Items per page selector */}
               {onLimitChange && (
                  <div className="flex items-center gap-2">
                     <Text className="text-sm text-gray-700">Itens por página:</Text>
                     <Select
                        value={limit.toString()}
                        onChange={handleLimitChange}
                        options={ITEMS_PER_PAGE_OPTIONS}
                        size="sm"
                        className="w-auto min-w-[120px]"
                     />
                  </div>
               )}
            </div>
            
            {/* Pagination controls */}
            <nav className="flex items-center gap-1" aria-label="Pagination">
               {/* First page */}
               <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPreviousPage}
                  onClick={() => handlePageChange(1)}
                  className="p-2"
               >
                  <PiCaretDoubleLeftBold className="h-4 w-4" />
               </Button>

               {/* Previous page */}
               <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasPreviousPage}
                  onClick={() => handlePageChange(page - 1)}
                  className="p-2"
               >
                  <PiCaretLeftBold className="h-4 w-4" />
               </Button>

               {/* Page numbers */}
               {getVisiblePages().map((pageNumber, index) => (
                  <div key={index}>
                     {pageNumber === '...' ? (
                        <span className="px-3 py-2 text-sm text-gray-500">...</span>
                     ) : (
                        <Button
                           variant={pageNumber === page ? 'solid' : 'outline'}
                           size="sm"
                           onClick={() => handlePageChange(Number(pageNumber))}
                           className="min-w-[40px]"
                        >
                           {pageNumber}
                        </Button>
                     )}
                  </div>
               ))}

               {/* Next page */}
               <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage}
                  onClick={() => handlePageChange(page + 1)}
                  className="p-2"
               >
                  <PiCaretRightBold className="h-4 w-4" />
               </Button>

               {/* Last page */}
               <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage}
                  onClick={() => handlePageChange(totalPages)}
                  className="p-2"
               >
                  <PiCaretDoubleRightBold className="h-4 w-4" />
               </Button>
            </nav>
         </div>
      </div>
   );
};
