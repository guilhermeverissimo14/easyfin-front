import { useEffect, useState } from 'react';
import { api } from '@/service/api';
import { ContractsType, ProductionRecord } from '@/types';
import AvatarCard from '@core/ui/avatar-card';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { FaTractor } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ContractsDetails = ({ id }: { id: string }) => {
    const [contractDetails, setContractDetails] = useState<ContractsType>({} as ContractsType);
    const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);

    useEffect(() => {
        const getContractDetails = async () => {
            try {
                const response = await api.get<ContractsType>(`/service-contracts/${id}`);
                setContractDetails(response.data);
            } catch (error) {
                // console.error('Erro ao buscar contrato:', error);
            }
        };
        getContractDetails();
    }, [id]);

    useEffect(() => {
        const fetchProductionRecords = async () => {
            try {
                const response = await api.get<ProductionRecord[]>(`/production-records/contract/${id}`);
                setProductionRecords(response.data);
            } catch (error) {
                // console.error('Erro ao buscar registros de produção:', error);
            }
        };
        fetchProductionRecords();
    }, [id]);

    return (
        <main>
            <div className="mb-4 flex flex-row items-center justify-between">
                {contractDetails.producer?.name ? (
                    <AvatarCard
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(contractDetails.producer.name)}&background=97CFB7&color=ffffff`}
                        name={contractDetails.producer.name}
                        description={contractDetails.reference}
                    />
                ) : (
                    <p>Carregando...</p>
                )}
                <div className="w-32 p-2">
                    {contractDetails.status === 'NAO_INICIADO' && (
                        <span className="bg-red-100 text-red-dark p-2 rounded-full whitespace-nowrap">Não Iniciado</span>
                    )}
                    {contractDetails.status === 'EM_ANDAMENTO' && (
                        <span className="bg-yellow-100 text-yellow-dark p-2 rounded-full whitespace-nowrap">Em Andamento</span>
                    )}
                    {contractDetails.status === 'FINALIZADO' && (
                        <span className="bg-green-100 text-green-dark p-2 rounded-full whitespace-nowrap">Finalizado</span>
                    )}
                    {!['NAO_INICIADO', 'EM_ANDAMENTO', 'FINALIZADO'].includes(contractDetails.status as string) && (
                        <span className="bg-gray-100 text-gray-dark p-2 rounded-full">{contractDetails.status}</span>
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
                <ul className="grid gap-4 p-5">
                    <li className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-bold text-gray-900">
                            Produtor:
                        </span>
                        <span className="text-sm md:text-base text-gray-700">
                            {contractDetails.producer?.name || 'Não informado'}
                        </span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-sm md:text-base font-bold text-gray-900">
                            Pilotos:
                        </span>
                        <span className="text-sm md:text-base text-gray-700 flex flex-col md:flex-row">
                            {contractDetails.pilots && contractDetails.pilots.length > 0 ? (
                                contractDetails.pilots.map((pilot, index) => (
                                    <span key={index}>
                                        {pilot.name || 'Não informado'}
                                        {index < (contractDetails.pilots ?? []).length - 1 && <>, &nbsp;</>}
                                    </span>
                                ))
                            ) : (
                                'Não informado'
                            )}
                        </span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-bold text-gray-900">
                            Hectares Estimados:
                        </span>
                        <span className="text-sm md:text-base text-gray-700">
                            {contractDetails.hectaresEstimate || 'Não informado'}
                        </span>
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-sm md:text-base font-bold text-gray-900">
                            Valor por Hectare:
                        </span>
                        <span className="text-sm md:text-base text-gray-700">
                            {contractDetails.valuePerHectare || 'Não informado'}
                        </span>
                    </li>
                    
                    {contractDetails.status === 'FINALIZADO' && (
                        <li className="flex items-center gap-2">
                            <span className="text-sm md:text-base font-bold text-gray-900">
                                Total de Hectares Trabalhados:
                            </span>
                            <span className="text-sm md:text-base text-gray-700 whitespace-nowrap">
                                {productionRecords.reduce((total, record) => total + (record.hectaresWorked || 0), 0)}
                            </span>
                        </li>
                    )}

                </ul>
            </div>

            {productionRecords.length > 0 && (
                <div className="bg-gray-100 w-full rounded-lg mt-6">
                    <VerticalTimeline className="overflow-y-auto max-h-[50vh] w-full">
                        {productionRecords.map((record) => (
                            <VerticalTimelineElement
                                className="vertical-timeline-element--work pr-5"
                                contentArrowStyle={{ borderRight: '7px solid rgb(0 128 0)' }}
                                key={record.id}
                                date={format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}
                                iconStyle={{ background: 'rgb(0 128 0)', color: '#fff' }}
                                icon={<FaTractor />}
                            >
                                <div className="flex flex-col gap-2">
                                    <li className="flex items-center gap-2">
                                        <h2 className="text-xs md:whitespace-nowrap md:text-base font-bold text-gray-900">
                                            Hectares Trabalhados:
                                        </h2>
                                        <span className="text-xs md:text-base text-gray-700 font-semibold">
                                            {record.hectaresWorked}
                                        </span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <h2 className="text-xs md:text-base font-bold text-gray-900">
                                            Piloto:
                                        </h2>
                                        <span className="text-[8px] md:text-base text-gray-700 font-semibold">
                                            {record.pilot?.name || 'Não informado'}
                                        </span>
                                    </li>
                                </div>
                            </VerticalTimelineElement>
                        ))}
                    </VerticalTimeline>
                </div>
            )}
        </main>
    );
};