import React, { createContext, useContext, useState } from 'react';

type SidebarContextType = {
   isCollapsed: boolean;
   toggleSidebar: () => void;
   setCollapsed: (collapsed: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
   const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

   const toggleSidebar = () => {
      setIsCollapsed(prev => !prev);
   };

   const setCollapsed = (collapsed: boolean) => {
      setIsCollapsed(collapsed);
   };

   return (
      <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
         {children}
      </SidebarContext.Provider>
   );
};

export const useSidebar = () => {
   const context = useContext(SidebarContext);
   if (!context) {
      throw new Error('useSidebar must be used within a SidebarProvider');
   }
   return context;
};