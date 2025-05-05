import { routes } from '@/config/routes';
import {
   PiChartBarDuotone,
   PiCurrencyCircleDollarDuotone,
   PiFileTextDuotone,
   PiRocketLaunchDuotone,
   PiTractorDuotone,
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
   // {
   //    name: 'Operações',
   //    href: '#',
   //    icon: <PiRocketLaunchDuotone />,
   //    dropdownItems: [
   //       {
   //          name: 'Serviços Ativos',
   //          href: routes.operational.services,
   //       },
   //       {
   //          name: 'Histórico de Contratos',
   //          href: routes.operational.contracts,
   //       },
   //    ],
   // },
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
   {
      name: 'Produtores',
      href: routes.producers,
      icon: <PiTractorDuotone />,
   },
   {
      name: 'Contratos',
      href: routes.contracts,
      icon: <PiFileTextDuotone />,
   },

];
