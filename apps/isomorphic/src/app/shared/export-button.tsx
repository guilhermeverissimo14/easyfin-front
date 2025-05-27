'use client';

import { PiArrowLineUpBold } from 'react-icons/pi';
import { Button } from 'rizzui';
import cn from '@core/utils/class-names';
import { ColumnDefinition, exportToXLSX } from '@core/utils/export-to-csv';


type ExportButtonProps = {
  data: unknown[];
  columns: ColumnDefinition[];
  fileName: string;
  className?: string;
};

export default function ExportButton({
  data,
  columns,
  fileName,
  className,
}: ExportButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => exportToXLSX(data, columns, fileName)}
      className={cn('w-full @lg:w-auto', className)}
    >
      <PiArrowLineUpBold className="me-1.5 h-[17px] w-[17px]" />
      Exportar
    </Button>
  );
}
