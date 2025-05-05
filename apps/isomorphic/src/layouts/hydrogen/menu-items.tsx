import { routes } from '@/config/routes';
import {
   PiChartBarDuotone,
   PiCurrencyCircleDollarDuotone,
   PiHandshakeDuotone,
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
      name: 'Financeiro',
      href: '#',
      icon: <PiCurrencyCircleDollarDuotone />,
      dropdownItems: [
         {
            name: 'Despesas',
            href: routes.financial.expenditure,
         },
         {
            name: 'Meus gastos',
            href: routes.financial.addExpenditure,
         },
         {
            name: 'Aprovar gastos',
            href: routes.UserFinancial,
         },
         {
            name: 'Folha',
            href: routes.financial.payrolls,
         },
      ],
   },
   // {
   //    name: 'Produtores',
   //    href: routes.producers,
   //    icon: <PiTractorDuotone />,
   // },
   // {
   //    name: 'Contratos',
   //    href: routes.contracts,
   //    icon: <PiFileTextDuotone />,
   // },

];
