'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';

const filterSchema = z.object({
   startDate: z.date().optional().nullable(),
   endDate: z.date().optional().nullable(),
});

type FilterFormData = z.infer<typeof filterSchema>;

interface FilterCashBookProps {
   onFilter: (startDate?: Date, endDate?: Date) => void;
   onClear: () => void;
}

export const FilterCashBook = ({ onFilter, onClear }: FilterCashBookProps) => {
   const [loading, setLoading] = useState(false);

   const {
      handleSubmit,
      formState: { errors },
      control,
      reset,
      watch
   } = useForm<FilterFormData>({
      resolver: zodResolver(filterSchema),
   });

   const startDate = watch('startDate');
   const endDate = watch('endDate');

   const onSubmit = async (data: FilterFormData) => {
      setLoading(true);
      
      try {
         onFilter(data.startDate || undefined, data.endDate || undefined);
      } finally {
         setLoading(false);
      }
   };

   const handleClear = () => {
      reset({
         startDate: null,
         endDate: null
      });
      onClear();
   };

   return (
      <div className="flex flex-col sm:flex-row gap-4 items-end">
         <Controller
            control={control}
            name="startDate"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Data Inicial"
                  selected={value}
                  onChange={onChange}
                  dateFormat="dd/MM/yyyy"
                  showMonthYearDropdown
                  minDate={new Date('2000-01-01')}
                  maxDate={endDate || new Date('2100-01-01')}
                  scrollableMonthYearDropdown
                  placeholderText="Data inicial"
                  popperPlacement="bottom-start"
                  inputProps={{
                     variant: 'outline',
                     inputClassName: 'px-3 py-2 h-auto [&_input]:text-ellipsis ring-0',
                  }}
                  className="flex-grow [&>label>span]:font-medium"
                  locale={ptBR}
               />
            )}
         />

         <Controller
            control={control}
            name="endDate"
            render={({ field: { onChange, value } }) => (
               <DatePicker
                  label="Data Final"
                  selected={value}
                  onChange={onChange}
                  dateFormat="dd/MM/yyyy"
                  showMonthYearDropdown
                  minDate={startDate || new Date('2000-01-01')}
                  maxDate={new Date('2100-01-01')}
                  scrollableMonthYearDropdown
                  placeholderText="Data final"
                  popperPlacement="bottom-start"
                  inputProps={{
                     variant: 'outline',
                     inputClassName: 'px-3 py-2 h-auto [&_input]:text-ellipsis ring-0',
                  }}
                  className="flex-grow [&>label>span]:font-medium"
                  locale={ptBR}
               />
            )}
         />

         <div className="flex gap-2">
            <Button 
               type="button" 
               variant="outline" 
               onClick={handleClear}
               className="whitespace-nowrap"
            >
               Limpar
            </Button>
            <Button 
               disabled={loading} 
               onClick={handleSubmit(onSubmit)}
               className="whitespace-nowrap"
            >
               {loading ? 'Filtrando...' : 'Filtrar'}
            </Button>
         </div>
      </div>
   );
};