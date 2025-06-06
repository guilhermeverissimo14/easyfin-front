import React from 'react';
const ExcelJS = require('exceljs');
const { saveAs } = require('file-saver');

export interface ColumnDefinition {
  accessor?: string | ((row: any) => any);
  header: string;
  id?: string;
  cell?: (info: any) => React.ReactNode;
  includeInExport?: boolean;
  // Nova propriedade para definir o tipo de dados na exportação
  dataType?: 'string' | 'number' | 'date' | 'currency';
}

export async function exportToXLSX(
  data: any[],
  columns: ColumnDefinition[],
  fileName: string
) {
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Dados');

  
  const exportColumns = columns?.filter(column => 
    column.includeInExport !== false && 
    column.id !== 'actions' && 
    !column.id?.includes('action') 
  );

  const headers = exportColumns?.map(column => column.header);
  
  
  worksheet.addRow(headers);
  
  // Configuração de estilo do cabeçalho
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell:any) => {
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
  
  // Processamento das linhas de dados
  for (const row of data || []) {
    const rowData: any[] = [];
    
    for (const column of exportColumns) {
      let value;
      
      const columnId = column.id || (typeof column.accessor === 'string' ? column.accessor : '');
      
      if (typeof column.accessor === 'string') {
        value = getNestedValue(row, column.accessor);
      } 
      
      else if (typeof column.accessor === 'function') {
        try {
          value = column.accessor(row);
        } catch (e) {
          value = '';
          console.error('Error executing accessor function', e);
        }
      }
      
      else if (column.cell) {
        const info = {
          row: { original: row },
          getValue: () => getNestedValue(row, columnId),
          renderValue: () => getNestedValue(row, columnId)
        };
        
        try {
          const cellOutput = column.cell(info);
          value = extractValueFromReactNode(cellOutput);
        } catch (e) {
          value = getNestedValue(row, columnId) || '';
        }
      }

      // Processa o valor com base no tipo de dados definido
      if (column.dataType === 'number' || column.dataType === 'currency') {
        value = convertToNumber(value);
      }

      rowData.push(value !== undefined ? value : '');
    }
    
    worksheet.addRow(rowData);
  }
  
  // Configuração de estilo das células de dados
  for (let rowIndex = 2; rowIndex <= data.length + 1; rowIndex++) {
    const dataRow = worksheet.getRow(rowIndex);
    dataRow.eachCell((cell:any, colIndex:number) => {
      // Configuração básica para todas as células
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle' };
      
      // Define formato numérico para colunas do tipo número ou moeda
      const column = exportColumns[colIndex - 1];
      if (column && column.dataType === 'number') {
        cell.numFmt = '#,##0.00';
      } else if (column && column.dataType === 'currency') {
        cell.numFmt = 'R$ #,##0.00';
      }
    });
    dataRow.height = 22;
  }

  // Ajuste automático da largura das colunas
  worksheet.columns.forEach((column:any, index:any) => {
    const headerLength = headers[index]?.length || 10;
    const maxContentLength = Math.max(
      ...data.map(row => {
        const value = row[exportColumns[index].id || ''];
        return value ? String(value).length : 0;
      }),
      0
    );
    
    column.width = Math.max(15, headerLength * 1.2, maxContentLength + 2);
  });

  // Gera e baixa o arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
}

// Função auxiliar para converter string de moeda para número
function convertToNumber(value: any): number {
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    // Remove símbolos de moeda e formatação
    const cleanValue = value
      .replace(/[^\d.,]/g, '') // Remove tudo exceto números, pontos e vírgulas
      .replace(/\./g, '')      // Remove pontos de separação de milhar
      .replace(',', '.');      // Substitui vírgula por ponto decimal
    
    return Number(cleanValue) || 0;
  }
  
  return 0;
}

function getNestedValue(obj: any, path: string): any {
  if (!path) return undefined;
  
 
  if (path.includes('.')) {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined ? o[key] : ''), obj);
  }
  

  return obj[path];
}


function extractValueFromReactNode(node: any): any {
  
  if (node === null || node === undefined || typeof node !== 'object') {
    return node;
  }
  

  if (React.isValidElement(node)) {
   
    if (node.props && typeof node.props === 'object' && 'children' in node.props && typeof node.props.children === 'string') {
      return node.props.children;
    }
    
   
    if (node.props && typeof node.props === 'object' && 'value' in node.props && node.props.value !== undefined) {
      return node.props.value;
    }
    
   
    if (node.props && typeof node.props === 'object' && 'children' in node.props) {
      return extractValueFromReactNode(node.props.children);
    }
  }
  
 
  if (Array.isArray(node)) {
    return node
      .map(item => extractValueFromReactNode(item))
      .filter(Boolean)
      .join(' ');
  }
  

  if (node && node.toString && typeof node.toString === 'function') {
    return node.toString();
  }
  
  return '';
}