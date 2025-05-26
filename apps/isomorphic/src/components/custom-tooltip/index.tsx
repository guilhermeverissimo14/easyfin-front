import { useState } from 'react';
import './style.css';

type CustomTooltipProps = {
   children: React.ReactNode;
   text: string;
};

export const CustomTooltip = ({ children, text }: CustomTooltipProps) => {
   const [visible, setVisible] = useState(false);

   return (
      <div className="relative inline-block" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
         {children}
         {visible && (
            <div className="custom-tooltip animate-fade-in absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform rounded bg-gray-800 px-3 py-2 text-center text-sm text-white opacity-0 shadow-lg">
               {text}
            </div>
         )}
      </div>
   );
};
