'use client';
import { useEffect, useState } from 'react';
import { Select, Button } from 'rizzui';
import { api } from '@/service/api';
import PageHeader from '@/app/shared/page-header';
import { toast } from 'react-toastify';
import { PiFilePdf, PiArrowLineUpBold } from 'react-icons/pi';
import { CostCenter, MonthData, ReportData, TypeOption, YearOption } from './types';
import { exportCostCenterAnalysisToXLSX } from './export-utils';
import { exportCostCenterAnalysisToPDF } from './export-utils-pdf';

const typeOptions: TypeOption[] = [
   { label: 'Tudo', value: undefined },
   { label: 'Crédito', value: 'C' },
   { label: 'Débito', value: 'D' },
];

const currentYear = new Date().getFullYear();
const yearOptions: YearOption[] = Array.from({ length: 5 }, (_, i) => ({
   label: (currentYear - i).toString(),
   value: currentYear - i,
}));

const monthNames = [
   'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function CostCenterAnalysisReport() {
   const [reportData, setReportData] = useState<ReportData | null>(null);
   const [loading, setLoading] = useState(false);
   const [selectedYear, setSelectedYear] = useState<YearOption>(yearOptions[0]);
   const [selectedType, setSelectedType] = useState<TypeOption>(typeOptions[0]);
   const [costCenters, setCostCenters] = useState<string[]>([]);

   const fetchReportData = async () => {
      if (!selectedYear) return;
      
      setLoading(true);
      try {
         const params: Record<string, string | number> = {
            year: selectedYear.value,
         };
         
         if (selectedType?.value) {
            params.type = selectedType.value;
         }
         
         const response = await api.get('/reports/cost-center-analysis', { params });
         setReportData(response.data);
         
         const allCostCenters = new Set<string>();
         response.data.months?.forEach((month: MonthData) => {
            month.costCenters?.forEach((cc: CostCenter) => {
               allCostCenters.add(cc.name);
            });
         });
         setCostCenters(Array.from(allCostCenters).sort());
      } catch (error) {
         console.error('Erro ao buscar dados do relatório:', error);
         toast.error('Erro ao carregar dados do relatório');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchReportData();
   }, [selectedYear, selectedType]);

   const getCostCenterBalance = (costCenterName: string, monthIndex: number): number => {
      if (!reportData?.months) return 0;
      
      const month = reportData.months.find(m => m.month === monthIndex + 1);
      if (!month) return 0;
      
      const costCenter = month.costCenters.find(cc => cc.name === costCenterName);
      return costCenter?.balance || 0;
   };

   const getCostCenterTotal = (costCenterName: string): number => {
      return monthNames.reduce((total, _, index) => {
         return total + getCostCenterBalance(costCenterName, index);
      }, 0);
   };

   const getMonthTotal = (monthIndex: number): number => {
      return costCenters.reduce((total, costCenter) => {
         return total + getCostCenterBalance(costCenter, monthIndex);
      }, 0);
   };

   const getGrandTotal = (): number => {
      return costCenters.reduce((total, costCenter) => {
         return total + getCostCenterTotal(costCenter);
      }, 0);
   };

   const handleExport = () => {
      exportCostCenterAnalysisToXLSX({
         reportData,
         costCenters,
         selectedType,
         selectedYear,
         getCostCenterBalance,
         getCostCenterTotal,
         getMonthTotal,
         getGrandTotal
      });
   };

   const handlePDFExport = () => {
      exportCostCenterAnalysisToPDF({
         reportData,
         costCenters,
         selectedType,
         selectedYear,
         getCostCenterBalance,
         getCostCenterTotal,
         getMonthTotal,
         getGrandTotal
      });
   };

   return (
      <>
         <PageHeader 
            title="Análise por Centro de Custo"
            breadcrumb={[
               { name: 'Dashboard', href: '/dashboard-admin' },
               { name: 'Relatórios' },
               { name: 'Análise por Centro de Custo' },
            ]}
         />
         
         <div className="space-y-6 @container">
            <div className="flex justify-between items-end mb-6">
               <div className="flex gap-4">
                  <div className="w-48">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                     </label>
                     <Select
                        options={typeOptions.map(option => ({
                           ...option,
                           value: option.value || ''
                        }))}
                        value={selectedType}
                        onChange={setSelectedType}
                        placeholder="Selecione o tipo"
                        displayValue={(option: TypeOption) => option?.label ?? ''}
                     />
                  </div>
                  <div className="w-48">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ano
                     </label>
                     <Select
                        options={yearOptions}
                        value={selectedYear}
                        onChange={setSelectedYear}
                        placeholder="Selecione o ano"
                        displayValue={(option: YearOption) => option?.label ?? ''}
                     />
                  </div>
               </div>
               
               <div className="flex gap-3">
                  <Button
                     variant="outline"
                     onClick={handleExport}
                     className="flex items-center"
                  >
                     <PiArrowLineUpBold className="me-1.5 h-[17px] w-[17px]" />
                     Exportar
                  </Button>
                  
                  <Button
                     variant="outline"
                     onClick={handlePDFExport}
                     className="flex items-center"
                  >
                     <PiFilePdf className="me-1.5 h-[17px] w-[17px]" />
                     Download PDF
                  </Button>
               </div>
            </div>

            {loading ? (
               <div className="flex justify-center items-center h-64">
                  <div className="text-lg">Carregando...</div>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Centro de Custo
                           </th>
                           {monthNames.map((month) => (
                              <th key={month} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                                 {month}
                              </th>
                           ))}
                           <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                              Total
                           </th>
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {costCenters.map((costCenter) => (
                           <tr key={costCenter} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                                 {costCenter}
                              </td>
                              {monthNames.map((_, index) => {
                                 const balance = getCostCenterBalance(costCenter, index);
                                 return (
                                    <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                       {balance.toLocaleString('pt-BR', {
                                          style: 'currency',
                                          currency: 'BRL'
                                       })}
                                    </td>
                                 );
                              })}
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-center bg-gray-50">
                                 {getCostCenterTotal(costCenter).toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                 })}
                              </td>
                           </tr>
                        ))}
                        <tr className="bg-gray-100 font-semibold">
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-r">
                              Total Geral
                           </td>
                           {monthNames.map((_, index) => {
                              const total = getMonthTotal(index);
                              return (
                                 <td key={index} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">
                                    {total.toLocaleString('pt-BR', {
                                       style: 'currency',
                                       currency: 'BRL'
                                    })}
                                 </td>
                              );
                           })}
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center bg-gray-200">
                              {getGrandTotal().toLocaleString('pt-BR', {
                                 style: 'currency',
                                 currency: 'BRL'
                              })}
                           </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      </>
   );
}