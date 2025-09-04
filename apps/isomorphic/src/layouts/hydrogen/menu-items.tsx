import { routes } from '@/config/routes';
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
   PiChartLineUpDuotone,
   PiReceiptDuotone,
   PiCreditCardDuotone,
   PiWalletDuotone,
   PiBookOpenDuotone,
   PiTargetDuotone,
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
          {
      name: 'Contas Bancárias',
      href: routes.bankAccounts,
      icon: <PiBankDuotone />,
   },
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
      ],
   },
   {
      name: 'Faturamento',
      href: '#',
      icon: <GiMoneyStack />,
      dropdownItems: [
         {
            name: 'Notas Fiscais',
            href: routes.invoicing,
            icon: <PiReceiptDuotone />,
         },
      ],
   },
   {
      name: 'Financeiro',
      href: '#',
      icon: <PiCurrencyCircleDollar />,
      dropdownItems: [
         {
            name: 'Contas a Pagar',
            href: routes.accountsPayable,
            icon: <PiCreditCardDuotone />,
         },
         {
            name: 'Contas a Receber',
            href: routes.accountsReceivable,
            icon: <PiWalletDuotone />,
         },
         {
            name: 'Livro Caixa',
            href: routes.cashBook,
            icon: <PiBookOpenDuotone />,
         },
      ],
   },
   {
      name: 'Relatórios',
      href: '#',
      icon: <PiChartLineUpDuotone />,
      dropdownItems: [
         {
            name: 'Análise por Centro de Custo',
            href: routes.reports.costCenterAnalysis,
            icon: <PiTargetDuotone />,
         },
      ],
   },
];
