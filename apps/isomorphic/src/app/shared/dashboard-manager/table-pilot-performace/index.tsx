'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';

import WidgetCard from '@core/components/cards/widget-card';
import cn from '@core/utils/class-names';
import TableComponent from '@/components/tables/table';

import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { PilotPerformance } from '@/types';
import { SkeletonLoader } from '@/components/skeleton/skeleton';
import { ListPilotPerformanceColumns } from './columns';
import { useFilter } from '@/app/contexts/filter-context';

export default function TablePilotPerformance({
    className,
}: {
    className?: string;
}) {

     const { period, startDate, endDate } = useFilter(); 

    const [pilotPerformanceData, setPilotPerformanceData] = useState<PilotPerformance[]>([]);
    const [loading, setLoading] = useState(false);

    async function getPilotPerformance() {
        setLoading(true);
        try {
            const params: Record<string, string | undefined> = {};
            if (startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
            } else if (period) {
                params.period = period;
            }

            const response = await apiCall(() =>
                api.get('dashboard/general-manager/pilot-performance', { params })
            );

            if (!response) {
                return;
            }

            setPilotPerformanceData(response.data);
        } catch (error) {
            console.error('Erro ao buscar desempenho dos pilotos:', error);
            if ((error as any)?.response?.status === 401) {
                localStorage.clear();
                redirect('/signin');
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPilotPerformance();
    }, [startDate, endDate, period]);

    return (
        <WidgetCard
            title="Desempenho por Piloto"
            titleClassName="text-gray-700 font-bold font-inter"
            headerClassName="items-center"
            className={cn('@container', className)}
        >
            {loading ? (
                <SkeletonLoader />
            ) : (
                <>
                    <TableComponent
                        column={ListPilotPerformanceColumns}
                        data={pilotPerformanceData}
                        tableHeader={true}
                        searchAble={false}
                        pagination={true}
                        loading={loading}
                        title=""
                    />
                </>
            )}
        </WidgetCard>
    );
}