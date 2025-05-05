import { routes } from '@/config/routes';
import {
   PiChartBarDuotone,
   PiCurrencyCircleDollarDuotone,
   PiFileTextDuotone,
   PiRocketLaunchDuotone,
   PiTractorDuotone,
   PiUserGearDuotone,
} from 'react-icons/pi';

export const menuItemsLocalManager = [
   {
      name: 'Visão Geral',
   },

   {
      name: 'Dashboard',
      href: routes.dashboardLocalManager,
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
            name: 'Gastos',
            href: routes.financial.addExpenditure,
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
