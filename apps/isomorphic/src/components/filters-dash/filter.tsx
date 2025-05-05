"use client";

import { useFilter } from "@/app/contexts/filter-context";
import DropdownAction from "@core/components/charts/dropdown-action";
import DateFiled from "../calendar/date-filed";
import { ptBR } from "date-fns/locale";
import { format, startOfDay } from "date-fns";


const periodOptions = [
   { value: 'monthly', label: 'Mensal' },
   { value: 'weekly', label: 'Semanal' },
   { value: 'yearly', label: 'Anual' },
];

export function FilterDash() {
   const { period, startDate, endDate, setPeriod, setStartDate, setEndDate } = useFilter();

   return (
      <div className="flex flex-col md:flex-row  w-full mb-6 items-center gap-4">
         <DropdownAction
            className="rounded-md border w-[300px]"
            
            options={periodOptions}
            onChange={(selected) => {
               setPeriod(selected as 'weekly' | 'monthly' | 'yearly' | undefined);
               setStartDate(undefined);
               setEndDate(undefined);
            }}
            dropdownClassName="!z-0"
         />
         <DateFiled
            selectsRange
            locale={ptBR}
            dateFormat={'dd-MMM-yyyy'}
            className="w-[300px] "
            placeholderText="Selecione o periodo"
            startDate={startDate ? new Date(startDate) : undefined}
            endDate={endDate ? new Date(endDate) : undefined}
            onChange={(dates: [Date | null, Date | null]) => {
               const [start, end] = dates;
               const normalizedStart = start ? startOfDay(start) : null;
               const normalizedEnd = end ? startOfDay(end) : null;
                  
               setStartDate(normalizedStart ? normalizedStart.toISOString() : undefined);
               setEndDate(normalizedEnd ? normalizedEnd.toISOString() : undefined);
               setPeriod(undefined);
            }}
            // inputProps={{
            //    label: 'Selecione o periodo',
            //    labelClassName: '[@media(min-width:1860px)]:hidden',
            // }}
         />
      </div>
   )
}