'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { PilotPerformance } from '@/types';
import { Text } from 'rizzui';

const columnHelper = createColumnHelper<PilotPerformance>();

export const ListPilotPerformanceColumns = [
    columnHelper.display({
        id: 'pilotName',
        size: 250,
        header: 'Nome do Piloto',
        cell: ({ row }) => <Text>{row.original.pilotName}</Text>,
    }),
    columnHelper.display({
        id: 'totalSpentFormatted',
        size: 250,
        header: 'Total Gasto',
        cell: ({ row }) => <Text>{row.original.totalSpentFormatted}</Text>,
    }),
    columnHelper.display({
        id: 'totalHectaresWorked',
        size: 250,
        header: 'Hectares Trabalhados',
        cell: ({ row }) => <Text>{row.original.totalHectaresWorked}</Text>,
    }),
]

