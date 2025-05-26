import { routes } from '@/config/routes';
import { LuPiggyBank } from 'react-icons/lu';
import { GiMoneyStack } from 'react-icons/gi';

import {
   PiBankDuotone,
   PiChartBarDuotone,
   PiNotebook,
   PiCurrencyCircleDollar,
   PiGridFourDuotone,
   PiHandshakeDuotone,
   PiPercentDuotone,
   PiStackDuotone,
   PiUserGearDuotone,
   PiFileCDuotone,
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
      name: 'Cadastros',
      href: '#',
      icon: <PiNotebook />,
      dropdownItems: [
         {
            name: 'Clientes',
            href: routes.customers,
            icon: <PiHandshakeDuotone />,
         },
         {
            name: 'Fornecedores',
            href: routes.suppliers,
            icon: <PiStackDuotone />,
         },
         {
            name: 'Usuários',
            href: routes.users,
            icon: <PiUserGearDuotone />,
         },
         {
            name: 'Aliquotas',
            href: routes.taxRates,
            icon: <PiPercentDuotone />,
         },
         {
            name: 'Centro de Custo',
            href: routes.constCenters,
            icon: <PiGridFourDuotone />,
         },
         {
            name: 'Condições de Pagamento',
            href: routes.paymentTerms,
            icon: <PiFileCDuotone />,
         },
      ],
   },
   {
      name: 'Caixa',
      href: '#',
      icon: <LuPiggyBank />,
   },
   {
      name: 'Contas Bancárias',
      href: routes.bankAccounts,
      icon: <PiBankDuotone />,
   },
   {
      name: 'Faturamento',
      href: '#',
      icon: <GiMoneyStack />,
      dropdownItems: [
         {
            name: 'Emitir Nota Fiscal',
            href: '#',
            //href: routes.sales,
         },
      ],
   },
   {
      name: 'Financeiro',
      href: '#',
      icon: <PiCurrencyCircleDollar />,
      dropdownItems: [
         {
            name: 'Lançamentos à Vista',
            href: '#',
            //href: routes.financial.expenditure,
         },
         {
            name: 'Contas a Pagar',
            href: '#',
            //href: routes.financial.payables,
         },
         {
            name: 'Contas a Receber',
            href: '#',
            //href: routes.financial.receivables,
         },
         {
            name: 'Livro Caixa',
            href: routes.cashBook,
         },
      ],
   },
];
