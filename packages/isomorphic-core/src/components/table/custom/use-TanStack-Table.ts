"use client";

import {
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arraySwap } from "@dnd-kit/sortable";
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  RowPinningState,
  SortingState,
  TableOptions,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  filterFns,
} from "@tanstack/react-table";
import React from "react";

interface ExtendTableOptions<T extends Record<string, unknown>>
  extends Omit<TableOptions<T>, "data" | "columns" | "getCoreRowModel" | "state"> {}

export function useTanStackTable<T extends Record<string, any>>({
  options,
  tableData,
  columnConfig,
}: {
  tableData: T[];
  options?: ExtendTableOptions<T>;
  columnConfig: ColumnDef<T, any>[];
}) {
  const [data, setData] = React.useState<T[]>([...tableData]);
  const [columns] = React.useState(() => [...columnConfig]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() => columns.map((c) => c.id!));
  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id), [data]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowPinning, setRowPinning] = React.useState<RowPinningState>({
    top: [],
    bottom: [],
  });

  // ===================================================================================================
  // these are custom functions dependent on dnd kit and react-table to handle Drag and Drop events
  const handleDragEndColumn = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arraySwap(columnOrder, oldIndex, newIndex);
      });
    }
  }, []);

  const handleDragEndRow = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((prevData) => {
        const oldIndex = prevData.findIndex((item) => item.id === active.id);
        const newIndex = prevData.findIndex((item) => item.id === over.id);
        return arraySwap(prevData, oldIndex, newIndex);
      });
    }
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  // these are custom functions dependent on dnd kit and react-table to handle Drag and Drop events
  // =================================================================================================

  // Custom global filter function that includes formatted date fields
  const customGlobalFilterFn = React.useCallback((row: any, columnId: string, value: string) => {
    const searchValue = value.toLowerCase();
    
    // Get all cell values from the row
    const cellValues = Object.values(row.original).map((cellValue: any) => {
      if (cellValue === null || cellValue === undefined) return '';
      
      // Handle date fields - check if it's a date string and format it
      if (typeof cellValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(cellValue)) {
        try {
          const date = new Date(cellValue);
          // Format as dd/MM/yyyy for Brazilian format
          const formattedDate = date.toLocaleDateString('pt-BR');
          return formattedDate;
        } catch {
          return String(cellValue);
        }
      }
      
      return String(cellValue);
    });
    
    // Search in all formatted values
    return cellValues.some(value => 
      value.toLowerCase().includes(searchValue)
    );
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      expanded,
      rowPinning,
      columnOrder,
      globalFilter,
      columnFilters,
    },
    ...options,
    getRowCanExpand: () => true,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    onRowPinningChange: setRowPinning,
    onColumnOrderChange: setColumnOrder,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: customGlobalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return {
    table,
    dataIds,
    setData,
    sensors,
    tableData: data,
    rowPinning,
    columnOrder,
    globalFilter,
    setRowPinning,
    setColumnOrder,
    setGlobalFilter,
    handleDragEndRow,
    handleDragEndColumn,
  };
}
