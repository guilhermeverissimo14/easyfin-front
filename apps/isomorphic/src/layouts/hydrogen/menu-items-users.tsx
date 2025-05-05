import { routes } from '@/config/routes';
import {
   PiChartBarDuotone,
   PiCurrencyCircleDollarDuotone,
   PiFactoryDuotone,
} from 'react-icons/pi';

export const menuItemsUsers = [
   {
      name: 'Visão Geral',
   },

   {
      name: 'Dashboard',
      href: routes.dashboardPilot,
      icon: <PiChartBarDuotone />,
   },
   {
      name: 'Financeiro',
      href: '#',
      icon: <PiCurrencyCircleDollarDuotone />,
      dropdownItems: [
         {
            name: 'Gastos',
            href: routes.financial.addExpenditure,
         },
      ],
   },


   
];
