'use client';
import { useState, useEffect } from 'react';
import { Select, Button } from 'rizzui';
import { api } from '@/service/api';
import PageHeader from '@/app/shared/page-header';
import { toast } from 'react-toastify';
import { DatePicker } from '@core/ui/datepicker';
import { ptBR } from 'date-fns/locale';
import {
    CostCenterTransactionsReport,
    CostCenterOption,
    Transaction
} from './types';
import { PiArrowUpBold, PiArrowDownBold, PiCaretUpBold, PiCaretDownBold } from 'react-icons/pi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function CostCenterTransactionsPage() {
    const [reportData, setReportData] = useState<CostCenterTransactionsReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [costCenters, setCostCenters] = useState<CostCenterOption[]>([]);
    const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenterOption | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [isChartMinimized, setIsChartMinimized] = useState(false);

    useEffect(() => {
        const fetchCostCenters = async () => {
            try {
                const response = await api.get('/cost-centers');
                const options = response.data.map((cc: any) => ({
                    label: cc.name,
                    value: cc.id,
                }));
                setCostCenters(options);
            } catch (error) {
                console.error('Erro ao buscar centros de custo:', error);
                toast.error('Erro ao carregar centros de custo');
            }
        };

        fetchCostCenters();
    }, []);

    const formatDateForAPI = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleGenerateReport = async () => {
        if (!selectedCostCenter || !startDate || !endDate) {
            toast.warning('Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            const params = {
                costCenterId: selectedCostCenter.value,
                startDate: formatDateForAPI(startDate),
                endDate: formatDateForAPI(endDate),
            };

            const response = await api.get('/reports/cost-center-transactions', { params });
            setReportData(response.data);
            toast.success('Relatório gerado com sucesso');
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            toast.error('Erro ao gerar relatório');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatDateWithOffset = (dateString: string) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toLocaleDateString('pt-BR');
    };

    const canGenerateReport = selectedCostCenter && startDate && endDate;

    return (
        <>
            <PageHeader
                title="Apuração por Centro de Custo"
                breadcrumb={[
                    { name: 'Dashboard', href: '/dashboard-admin' },
                    { name: 'Relatórios' },
                    { name: 'Apuração por Centro de Custo' },
                ]}
            />

            <div className="space-y-6 @container">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Filtros do Relatório</h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">
                                Centro de Custo *
                            </label>
                            <Select
                                options={costCenters}
                                value={selectedCostCenter}
                                onChange={setSelectedCostCenter}
                                placeholder="Selecione o centro de custo"
                                displayValue={(option: CostCenterOption) => option?.label ?? ''}
                                className="[&_button]:h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Data Inicial *
                            </label>
                            <DatePicker
                                selected={startDate}
                                onChange={setStartDate}
                                dateFormat="dd/MM/yyyy"
                                minDate={new Date('1900-01-01')}
                                maxDate={endDate || new Date('2100-01-01')}
                                showMonthYearDropdown
                                scrollableMonthYearDropdown
                                placeholderText="Selecione a data inicial"
                                popperPlacement="bottom-start"
                                locale={ptBR}
                                inputProps={{
                                    inputClassName: 'h-11'
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleGenerateReport}
                            disabled={!canGenerateReport || loading}
                            isLoading={loading}
                            size="lg"
                            className="px-8 shadow-lg hover:shadow-xl transition-all"
                        >
                            Gerar Relatório
                        </Button>
                    </div>
                </div>

                {reportData && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {reportData.costCenter.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Período: {formatDateWithOffset(reportData.period.startDate)} até {formatDate(reportData.period.endDate)}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-green-800">Receitas</span>
                                        <PiArrowUpBold className="h-5 w-5 text-green-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-green-900">
                                        {formatCurrency(reportData.totals.totalRevenue)}
                                    </p>
                                </div>

                                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-red-800">Despesas</span>
                                        <PiArrowDownBold className="h-5 w-5 text-red-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-red-900">
                                        {formatCurrency(reportData.totals.totalExpenses)}
                                    </p>
                                </div>

                                <div className={`rounded-lg p-4 border ${reportData.totals.net >= 0
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-orange-50 border-orange-200'
                                    }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-sm font-medium ${reportData.totals.net >= 0 ? 'text-blue-800' : 'text-orange-800'
                                            }`}>
                                            Saldo Líquido
                                        </span>
                                    </div>
                                    <p className={`text-2xl font-bold ${reportData.totals.net >= 0 ? 'text-blue-900' : 'text-orange-900'
                                        }`}>
                                        {formatCurrency(reportData.totals.net)}
                                    </p>
                                </div>
                            </div>

                            {(reportData.totals.totalRevenue > 0 || reportData.totals.totalExpenses > 0) && (
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 mb-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            Distribuição de Receitas e Despesas
                                        </h4>
                                        <button
                                            onClick={() => setIsChartMinimized(!isChartMinimized)}
                                            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                                            title={isChartMinimized ? 'Maximizar' : 'Minimizar'}
                                        >
                                            {isChartMinimized ? (
                                                <PiCaretDownBold className="h-5 w-5 text-gray-600" />
                                            ) : (
                                                <PiCaretUpBold className="h-5 w-5 text-gray-600" />
                                            )}
                                        </button>
                                    </div>

                                    {!isChartMinimized && (
                                        <div className="h-[350px] flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={[
                                                            {
                                                                name: 'Receitas',
                                                                value: reportData.totals.totalRevenue,
                                                                color: '#10b981'
                                                            },
                                                            {
                                                                name: 'Despesas',
                                                                value: reportData.totals.totalExpenses,
                                                                color: '#ef4444'
                                                            }
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }: any) =>
                                                            `${name}: ${(percent * 100).toFixed(1)}%`
                                                        }
                                                        outerRadius={120}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        className="[&_.recharts-layer:focus]:outline-none [&_.recharts-sector:focus]:outline-none"
                                                    >
                                                        {[
                                                            { color: '#10b981' },
                                                            { color: '#ef4444' }
                                                        ].map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        formatter={(value: number) => formatCurrency(value)}
                                                        contentStyle={{
                                                            backgroundColor: 'white',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                                        }}
                                                    />
                                                    <Legend
                                                        verticalAlign="bottom"
                                                        height={36}
                                                        formatter={(value: any, entry: any) => (
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {value}: {formatCurrency(entry.payload.value)}
                                                            </span>
                                                        )}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <PiArrowUpBold className="h-5 w-5 text-green-600 mr-2" />
                                        Receitas ({reportData.revenues.length})
                                    </h4>

                                    {reportData.revenues.length > 0 ? (
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                            {reportData.revenues.map((transaction: Transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className="border border-green-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">
                                                                {transaction.historic}
                                                            </p>
                                                            {transaction.description && (
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {transaction.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="font-bold text-green-700 ml-4">
                                                            {formatCurrency(transaction.value)}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <span>{formatDate(transaction.date)}</span>
                                                        {transaction.documentNumber && (
                                                            <span>Doc: {transaction.documentNumber}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Nenhuma receita encontrada no período</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <PiArrowDownBold className="h-5 w-5 text-red-600 mr-2" />
                                        Despesas ({reportData.expenses.length})
                                    </h4>

                                    {reportData.expenses.length > 0 ? (
                                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                            {reportData.expenses.map((transaction: Transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className="border border-red-200 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">
                                                                {transaction.historic}
                                                            </p>
                                                            {transaction.description && (
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {transaction.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="font-bold text-red-700 ml-4">
                                                            {formatCurrency(transaction.value)}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <span>{formatDate(transaction.date)}</span>
                                                        {transaction.documentNumber && (
                                                            <span>Doc: {transaction.documentNumber}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Nenhuma despesa encontrada no período</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!reportData && !loading && (
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
                        <p className="text-gray-600">
                            Selecione os filtros e clique em "Gerar Relatório" para visualizar os dados
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
