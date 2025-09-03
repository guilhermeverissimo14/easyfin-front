import React, { useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { Flex, Input, TableVariantProps, Title } from 'rizzui';
import { DragAbleCellWrapper, DragAbleHeadWrapper } from '@core/components/table/custom';
import Table from '@core/components/table';
import { useTanStackTable } from '@core/components/table/custom/use-TanStack-Table';
import TablePagination from '@core/components/table/pagination';
import { SkeletonLoader } from '../skeleton/skeleton';

export default function TableComponent({
   searchAble = true,
   variant = 'elegant',
   tableHeader = true,
   pagination = true,
   data,
   column,
   title = '',
   loading = false,
   customFilters,
   pageSize = 25, 
}: {
   searchAble: boolean;
   variant?: TableVariantProps;
   tableHeader: boolean;
   pagination: boolean;
   data: any[];
   column: any;
   title: string;
   loading: boolean;
   customFilters?: React.ReactNode;
   pageSize?: number;
}) {
   const getList = async () => {
      setData(data);
   };

   useEffect(() => {
      getList();
   }, [data]);

   const { table, setData, handleDragEndColumn, sensors, columnOrder } = useTanStackTable<any>({
      tableData: data,
      columnConfig: column,
      options: {
         initialState: {
            pagination: {
               pageIndex: 0,
               pageSize: pagination ? pageSize : data.length,
            },
         },
         enableColumnResizing: false,
      },
   });

   return (
      <>
         {tableHeader && (
            <div className="mb-4">
               <Flex direction="col" justify="between" className="mb-4 xs:flex-row xs:items-center">
                  <Title as="h3" className="text-lg font-semibold text-gray-800">
                     {title}
                  </Title>
                  {searchAble && (
                     <Input
                        type="search"
                        clearable={true}
                        placeholder="Pesquisar..."
                        onClear={() => table.setGlobalFilter('')}
                        value={table.getState().globalFilter ?? ''}
                        prefix={<PiMagnifyingGlassBold className="size-4" />}
                        onChange={(e) => table.setGlobalFilter(e.target.value)}
                        className="w-full xs:max-w-60"
                     />
                  )}
               </Flex>
               {customFilters && (
                  <div className="border-t pt-4">
                     {customFilters}
                  </div>
               )}
            </div>
         )}
         {loading ? (
            <SkeletonLoader />
         ) : (
            <DndContext collisionDetection={closestCenter} modifiers={[restrictToHorizontalAxis]} onDragEnd={handleDragEndColumn} sensors={sensors}>
               <Table
                  table={table}
                  variant={variant}
                  showLoadingText={loading}
                  columnOrder={columnOrder}
                  components={{
                     headerCell: DragAbleHeadWrapper,
                     bodyCell: DragAbleCellWrapper,
                  }}
                  classNames={{
                     rowClassName: 'last:border-1',
                     headerClassName: 'bg-gray-200 text-gray-600 font-bold',
                  }}
               />
            </DndContext>
         )}
         {pagination && !loading && <TablePagination table={table} className="mt-4" />}
      </>
   );
}
