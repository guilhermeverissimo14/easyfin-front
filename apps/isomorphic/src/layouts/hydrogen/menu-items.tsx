import { routes } from '@/config/routes';
import { icon } from 'leaflet';
import {
   PiBankDuotone,
   PiChartBarDuotone,
   PiCurrencyCircleDollarDuotone,
   PiGridFourDuotone,
   PiHandshakeDuotone,
   PiPercentDuotone,
   PiStackDuotone,
   PiUserGearDuotone,
   PiFileCDuotone
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
      name: 'Contas Bancárias',
      href: routes.bankAccounts,
      icon:  <PiBankDuotone />,
   },

   {
      name : 'Centro de Custo',
      href: routes.constCenters,
      icon: <PiGridFourDuotone/>,
   },

   {
      name: "Condições de Pagamento",
      href: routes.paymentTerms,
      icon: <PiFileCDuotone />,
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
