import { ExportParams } from './types';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const exportCostCenterAnalysisToPDF = async (params: ExportParams): Promise<void> => {
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

  try {
    // Criar PDF em Portrait
    const doc = new jsPDF('portrait', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Função para criar cabeçalho da página
    const createPageHeader = () => {
      // Logo aumentada
      try {
        doc.addImage('/images/logo_principal.png', 'PNG', 20, 10, 40, 20);
      } catch (error) {
        console.warn('Logo não encontrada, continuando sem logo');
      }
      
      // Título movido para a direita para não sobrepor a logo
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Relatório de Análise por Centro de Custo', 70, 20);
      
      // Informações do relatório
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const tipoLabel = selectedType?.label === 'Tudo' ? 'Crédito/Débito' : (selectedType?.label || 'Crédito/Débito');
      doc.text(`Tipo: ${tipoLabel} | Ano: ${selectedYear.value}`, 70, 28);
    };
    
    // Criar primeira página
    createPageHeader();
    
    // Definir trimestres
    const quarters = [
      { name: '1º Trimestre', months: [0, 1, 2], monthNames: ['Janeiro', 'Fevereiro', 'Março'] },
      { name: '2º Trimestre', months: [3, 4, 5], monthNames: ['Abril', 'Maio', 'Junho'] },
      { name: '3º Trimestre', months: [6, 7, 8], monthNames: ['Julho', 'Agosto', 'Setembro'] },
      { name: '4º Trimestre', months: [9, 10, 11], monthNames: ['Outubro', 'Novembro', 'Dezembro'] }
    ];
    
    let currentY = 40;
    
    quarters.forEach((quarter, quarterIndex) => {
      // Nova página para cada trimestre (exceto o primeiro)
      if (quarterIndex > 0) {
        doc.addPage();
        createPageHeader();
        currentY = 40;
      }
      
      // Título do trimestre
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(quarter.name, 20, currentY);
      currentY += 10;
      
      // Preparar dados da tabela
      const tableData = costCenters.map(costCenter => {
        const row = [costCenter];
        
        // Adicionar valores dos meses
        quarter.months.forEach(monthIndex => {
          const balance = getCostCenterBalance(costCenter, monthIndex);
          row.push(balance.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }));
        });
        
        // Total do trimestre para este centro de custo
        const quarterTotal = quarter.months.reduce((sum, monthIndex) => {
          return sum + getCostCenterBalance(costCenter, monthIndex);
        }, 0);
        
        row.push(quarterTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }));
        
        return row;
      });
      
      // Linha de totais
      const totalRow = ['TOTAL GERAL'];
      quarter.months.forEach(monthIndex => {
        const total = getMonthTotal(monthIndex);
        totalRow.push(total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }));
      });
      
      // Total geral do trimestre
      const quarterGrandTotal = quarter.months.reduce((sum, monthIndex) => {
        return sum + getMonthTotal(monthIndex);
      }, 0);
      
      totalRow.push(quarterGrandTotal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }));
      
      tableData.push(totalRow);
      
      // Criar tabela usando autoTable - com altura de linha reduzida
      const headers = ['Centro de Custo', ...quarter.monthNames, 'Total Trimestre'];
      
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: currentY,
        theme: 'grid',
        headStyles: {
          fillColor: [64, 64, 64],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          minCellHeight: 6
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 2,
          minCellHeight: 5
        },
        columnStyles: {
          0: { 
            cellWidth: 60, 
            halign: 'left',
            fontStyle: 'normal'
          },
          1: { 
            cellWidth: 25, 
            halign: 'center' 
          },
          2: { 
            cellWidth: 25, 
            halign: 'center' 
          },
          3: { 
            cellWidth: 25, 
            halign: 'center' 
          },
          4: { 
            cellWidth: 30, 
            halign: 'center',
            fontStyle: 'bold'
          }
        },
        alternateRowStyles: {
          fillColor: [248, 248, 248]
        },
        didParseCell: function(data: any) {
          // Destacar linha de total
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fillColor = [220, 220, 220];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [0, 0, 0];
          }
        },
        margin: { left: 20, right: 20 },
        tableWidth: 'auto'
      });
      
      // Atualizar posição Y após a tabela
      currentY = (doc as any).lastAutoTable.finalY + 10;
      
      // Adicionar "Emitido em" abaixo da tabela, alinhado à direita, em fonte pequena
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleDateString('pt-BR');
      doc.text(`Emitido em: ${currentDate}`, pageWidth - 25, currentY, { align: 'right' });
      
      currentY += 10;
      
      // Adicionar resumo do trimestre
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Total do ${quarter.name}: ${quarterGrandTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })}`, 
        20, 
        currentY
      );
      
      currentY += 10;
    });
    
    // Adicionar página de resumo anual
    doc.addPage();
    createPageHeader();
    currentY = 40;
    
    // Título do resumo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Resumo Anual', 20, currentY);
    currentY += 15;
    
    // Preparar dados do resumo anual
    const summaryData = costCenters.map(costCenter => [
      costCenter,
      getCostCenterTotal(costCenter).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    ]);
    
    // Adicionar linha de total geral
    summaryData.push([
      'TOTAL GERAL ANUAL',
      getGrandTotal().toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      })
    ]);
    
    // Criar tabela de resumo com altura reduzida
    autoTable(doc, {
      head: [['Centro de Custo', 'Total Anual']],
      body: summaryData,
      startY: currentY,
      theme: 'grid',
      headStyles: {
        fillColor: [64, 64, 64],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
        minCellHeight: 6
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 2,
        minCellHeight: 5
      },
      columnStyles: {
        0: { 
          cellWidth: 100, 
          halign: 'left',
          fontStyle: 'normal'
        },
        1: { 
          cellWidth: 60, 
          halign: 'center' 
        }
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      didParseCell: function(data: any) {
        // Destacar linha de total geral
        if (data.row.index === summaryData.length - 1) {
          data.cell.styles.fillColor = [220, 220, 220];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontSize = 10;
        }
      },
      margin: { left: 20, right: 20 }
    });
    
    // Adicionar "Emitido em" na página de resumo também
    const summaryFinalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const currentDate = new Date().toLocaleDateString('pt-BR');
    doc.text(`Emitido em: ${currentDate}`, pageWidth - 30, summaryFinalY, { align: 'right' });
    
    // Adicionar rodapé com informações adicionais
    const finalY = summaryFinalY + 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}`,
      pageWidth / 2,
      finalY,
      { align: 'center' }
    );
    
    // Salvar PDF
    doc.save(`Analise-Centro-Custo-${selectedYear.value}.pdf`);
    toast.success('PDF exportado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error('Erro ao gerar PDF: ' + (error as Error).message);
  }
};