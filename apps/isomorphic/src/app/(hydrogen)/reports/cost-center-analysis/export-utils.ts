import { ExportParams } from './types';
import { toast } from 'react-toastify';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const exportCostCenterAnalysisToXLSX = (params: ExportParams): void => {
  const {
    reportData,
    costCenters,
    selectedType,
    selectedYear,
    getCostCenterBalance,
    getCostCenterTotal,
    getMonthTotal,
    getGrandTotal
  } = params;

  if (!reportData) {
    toast.error('Nenhum dado disponível para exportar');
    return;
  }

  const exportData = costCenters.map(costCenter => {
    const row: Record<string, string | number> = { 'Centro de Custo': costCenter };
    monthNames.forEach((month, index) => {
      row[month] = getCostCenterBalance(costCenter, index);
    });
    row['Total'] = getCostCenterTotal(costCenter);
    return row;
  });

  const totalRow: Record<string, string | number> = { 'Centro de Custo': 'Total Geral' };
  monthNames.forEach((month, index) => {
    totalRow[month] = getMonthTotal(index);
  });
  totalRow['Total'] = getGrandTotal();
  exportData.push(totalRow);

  const columns = [
    { header: 'Centro de Custo', accessor: 'Centro de Custo', dataType: 'string' },
    ...monthNames.map(month => ({ 
      header: month, 
      accessor: month, 
      dataType: 'currency' 
    })),
    { header: 'Total', accessor: 'Total', dataType: 'currency' }
  ];

  import('@core/utils/export-to-csv').then(() => {
    const ExcelJS = require('exceljs');
    const { saveAs } = require('file-saver');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados');
    
    worksheet.mergeCells('A1:K1');
    worksheet.getCell('A1').value = 'Relatório de Análise por Centro de Custo';
    worksheet.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF404040' }
    };
    
    worksheet.mergeCells('L1:M1');
    const tipoLabel = selectedType?.label || 'Tudo';
    worksheet.getCell('L1').value = `Tipo: ${tipoLabel}`;
    worksheet.getCell('L1').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell('L1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('L1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF404040' }
    };
    
    worksheet.getCell('N1').value = `Ano: ${selectedYear.value}`;
    worksheet.getCell('N1').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getCell('N1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('N1').fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF404040' }
    };
    
    const headers = columns.map(col => col.header);
    worksheet.addRow(headers);
    
    const headerRow = worksheet.getRow(2);
    headerRow.eachCell((cell: any) => {
      cell.font = { bold: true, size: 12, color: { argb: 'FF000000' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    headerRow.height = 25;
    
    exportData.forEach((row, index) => {
      const rowData = columns.map(col => row[col.accessor]);
      const excelRow = worksheet.addRow(rowData);
      
      const isLastRow = index === exportData.length - 1;
      
      excelRow.eachCell((cell: any, colIndex: number) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle' };
        
        if (colIndex > 1) {
          cell.numFmt = 'R$ #,##0.00';
        }
        
        if (isLastRow) {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEEEEEE' }
          };
        }
        
        if (colIndex === columns.length) {
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEEEEEE' }
          };
        }
      });
      
      excelRow.height = 22;
    });
    
    worksheet.columns.forEach((column: any, index: number) => {
      const headerLength = headers[index]?.length || 10;
      if (index === 0) {
        column.width = Math.max(32, headerLength * 1.2);
      } else {
        column.width = Math.max(16, headerLength * 1.2);
      }
    });
    
    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      saveAs(new Blob([buffer]), `Analise-Centro-Custo-${selectedYear.value}.xlsx`);
    });
  });
};