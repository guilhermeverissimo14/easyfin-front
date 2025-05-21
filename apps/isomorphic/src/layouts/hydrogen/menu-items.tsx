import { routes } from '@/config/routes';
import {
   PiChartBarDuotone,
   PiCurrencyCircleDollarDuotone,
   PiHandshakeDuotone,
   PiPercentDuotone,
   PiStackDuotone,
   PiUserGearDuotone,
} from 'react-icons/pi';

export const menuItems = [
   {
      name: 'Visão Geral',
   },
   {
      name: 'Dashboard',
      href: routes.dashboardAdmin,
      icon: <PiChartBarDuotone />,
   },
   
   {
      name: 'Usuários',
      href: routes.users,
      icon: <PiUserGearDuotone />,
   },

   {
      name: "Clientes",
      href: routes.customers,
      icon: <PiHandshakeDuotone />,
   },

   {
      name: "Fornecedores",
      href: routes.suppliers,
      icon: <PiStackDuotone />,
   },

   {
      name: 'Aliquotas',
      href: routes.taxRates,
      icon:<PiPercentDuotone/>,
   },
   
   {
      name: 'Financeiro',
      href: '#',
      icon: <PiCurrencyCircleDollarDuotone />,
      dropdownItems: [
         {
            name: 'Despesas',
            href: routes.financial.expenditure,
         },
         
      ],
   },
  

];
