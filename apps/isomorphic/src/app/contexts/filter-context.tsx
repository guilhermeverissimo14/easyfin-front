import React, { createContext, useContext, useState } from 'react';

type FilterContextType = {
   period: 'weekly' | 'monthly' | 'yearly' | undefined;
   startDate: string | undefined;
   endDate: string | undefined;
   setPeriod: (period: 'weekly' | 'monthly' | 'yearly' | undefined) => void;
   setStartDate: (date: string | undefined) => void;
   setEndDate: (date: string | undefined) => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
   const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly' |  undefined>("monthly");
   const [startDate, setStartDate] = useState<string | undefined>(undefined);
   const [endDate, setEndDate] = useState<string | undefined>(undefined);

   return (
      <FilterContext.Provider value={{ period, startDate, endDate, setPeriod, setStartDate, setEndDate }}>
         {children}
      </FilterContext.Provider>
   );
};

export const useFilter = () => {
   const context = useContext(FilterContext);
   if (!context) {
      throw new Error('useFilter must be used within a FilterProvider');
   }
   return context;
};