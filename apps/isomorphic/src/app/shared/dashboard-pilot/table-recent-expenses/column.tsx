'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { Text } from 'rizzui';
import { TableRecentExpense } from '@/types';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';

const columnHelper = createColumnHelper<TableRecentExpense>();

export const ListRecentExpensesColumns = [
    columnHelper.display({
        id: 'expense',
        size: 150,
        header: 'Despesa',
        cell: ({ row }) => <Text>{row.original.expense}</Text>,
    }),
    columnHelper.display({
        id: 'description',
        size: 200,
        header: 'Descrição',
        cell: ({ row }) => {
            const description = row.original?.description;
            const displayText = 
                !description || description === "undefined" || description === "" 
                    ? "-" 
                    : description.length > 30 
                        ? `${description.substring(0, 30)}...` 
                        : description;
            
            return (
                <Text title={description || "-"}>
                    {displayText}
                </Text>
            );
        },
    }),
    columnHelper.display({
        id: 'valueFormatted',
        size: 150,
        header: 'Valor',
        cell: ({ row }) => <Text>{row.original.valueFormatted}</Text>,
    }),
    columnHelper.display({
        id: 'date',
        size: 120,
        header: 'Data',
        cell: ({ row }) => (
            <Text>
                {row.original.date}
            </Text>
        ),
    }),
    columnHelper.display({
        id: 'approved',
        size: 120,
        header: 'Status',
        cell: ({ row }) => (
            <>
                {getStatusBadge(row.original.approved ?? false, row.original.approved ? 'Aprovado' : 'Pendente')}
            </>
        ),
    }),
    // columnHelper.display({
    //     id: 'approvedBy',
    //     size: 150,
    //     header: 'Aprovado por',
    //     cell: ({ row }) => <Text>{row.original.approvedBy || '-'}</Text>,
    // }),
    columnHelper.display({
        id: 'approvedAt',
        size: 200,
        header: 'Data de aprovação',
        cell: ({ row }) => (
            <Text>
                {row.original.approvedAt}
            </Text>
        ),
    }),
];