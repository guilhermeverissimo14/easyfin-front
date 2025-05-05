'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';
import TableComponent from '@/components/tables/table';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { SkeletonLoader } from '@/components/skeleton/skeleton';
import { ListRecentExpensesColumns } from './column';
import { TableRecentExpense, userType } from '@/types';
import { Text, Input, Select } from 'rizzui';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { debounce } from 'lodash';

interface RecentExpensesResponse {
    recentExpenses: TableRecentExpense[];
    total: number;
    totalFormatted: string;
}

export default function TableRecentExpenses({
    className,
}: {
    className?: string;
}) {
    const [expensesData, setExpensesData] = useState<TableRecentExpense[]>([]);
    const [totalExpense, setTotalExpense] = useState<string>('R$ 0,00');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [status, setStatus] = useState<{ label: string, value: 'all' | 'approved' | 'pending' }>();

    const sessionUser: userType = JSON.parse(localStorage.getItem('eas:user') || '{}') as userType;

    const statusOptions = [
        { label: 'Todos', value: 'all' },
        { label: 'Aprovados', value: 'approved' },
        { label: 'Pendentes', value: 'pending' },
    ];

    const debouncedSearch = debounce((term: string) => {
        getRecentExpenses(term);
    }, 500);

    async function getRecentExpenses(expenseName?: string) {
        setLoading(true);
        try {
            const params: Record<string, string | undefined> = {};

            if (sessionUser?.id) {
                params.pilotId = sessionUser.id;
            }

            if (expenseName) {
                params.expenseName = expenseName;
            }

            if (status && status.value !== 'all') {
                params.status = status.value;
            }

            const response = await apiCall(() =>
                api.get<RecentExpensesResponse>('dashboard/pilot/recent-expenses', { params })
            );

            if (response?.data) {
                setExpensesData(response.data.recentExpenses);
                setTotalExpense(response.data.totalFormatted);
            }
        } catch (error) {
            console.error('Erro ao buscar despesas recentes:', error);
            if ((error as any)?.response?.status === 401) {
                localStorage.clear();
                redirect('/signin');
            }
            setExpensesData([]);
            setTotalExpense('R$ 0,00');
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleStatusChange = (value: string) => {
        setStatus(value as any);
    };

    useEffect(() => {
        getRecentExpenses(searchTerm);
    }, [status]);

    useEffect(() => {
        getRecentExpenses();
    }, []);

    return (
        <WidgetCard
            titleClassName="text-gray-700 font-bold font-inter"
            headerClassName="items-center"
            className={cn('@container', className)}
        >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex flex-col md:flex-row gap-4 sm:items-center  md:w-[60%]">
                    <h3>Despesas recentes</h3>

                    <Input
                        type="search"
                        placeholder="Buscar despesa..."
                        value={searchTerm}
                        onChange={handleSearch}
                        prefix={<PiMagnifyingGlass className="h-4 w-4 text-gray-500" />}
                        className="w-full max-w-xs"
                    />
                    <Select
                        options={statusOptions}
                        value={status || ''}
                        onChange={handleStatusChange}
                        className="w-full sm:w-40"
                        placeholder="Status"
                    />
                </div>
                <Text className="text-sm text-gray-500 mt-2 sm:mt-0">
                    Total de despesas: <span className="font-semibold text-gray-700">{totalExpense}</span>
                </Text>
            </div>

            {loading ? (
                <SkeletonLoader />
            ) : (
                <TableComponent
                    column={ListRecentExpensesColumns}
                    data={expensesData}
                    tableHeader={true}
                    searchAble={false}
                    pagination={true}
                    loading={loading}
                    title=""
                />
            )}
        </WidgetCard>
    );
}