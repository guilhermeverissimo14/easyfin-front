import React from 'react';
const ExcelJS = require('exceljs');
const { saveAs } = require('file-saver');

export interface ColumnDefinition {
  accessor?: string | ((row: any) => any);
  header: string;
  id?: string;
  cell?: (info: any) => React.ReactNode;
  includeInExport?: boolean;
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

      rowData.push(value !== undefined ? value : '');
    }
    
    worksheet.addRow(rowData);
  }
  
 
  for (let rowIndex = 2; rowIndex <= data.length + 1; rowIndex++) {
    const dataRow = worksheet.getRow(rowIndex);
    dataRow.eachCell((cell:any) => {
      
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle' };
    });
    dataRow.height = 22; 
  }

  
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

 
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${fileName}.xlsx`);
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