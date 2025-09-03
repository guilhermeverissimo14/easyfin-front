export const TablePagination = ({ pagination, onPageChange, onLimitChange }: any) => {
   return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-white border-t border-gray-200">
         <div className="flex flex-1 justify-between sm:hidden">
            <button
               onClick={() => onPageChange(pagination.page - 1)}
               disabled={!pagination.hasPreviousPage}
               className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
               Anterior
            </button>
            <span className="text-sm text-gray-700 self-center font-medium">
               Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
               onClick={() => onPageChange(pagination.page + 1)}
               disabled={!pagination.hasNextPage}
               className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
               Próximo
            </button>
         </div>
         
         <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
               
               {onLimitChange && (
                  <div className="flex items-center gap-2">
                     <span className="text-sm text-gray-700 font-medium">Itens por página:</span>
                     <select
                        value={pagination.limit}
                        onChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
                        className="block rounded-lg border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-white"
                     >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                     </select>
                  </div>
               )}
            </div>
            
            <div className="flex items-center gap-3">
               <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
               >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
               </button>
               
               <span className="text-sm text-gray-700 px-4 py-2 font-medium bg-gray-50 rounded-lg">
                  Página {pagination.page} de {pagination.totalPages}
               </span>
               
               <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
               >
                  Próximo
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
               </button>
            </div>
         </div>
      </div>
   );
};