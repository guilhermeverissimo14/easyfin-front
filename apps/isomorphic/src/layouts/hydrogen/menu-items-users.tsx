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
} from 'react-icons/pi';

export const menuItemsUsers = [
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
            }
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
            },
            {
               name: 'Contas a Receber',
               href: routes.accountsReceivable,
            },
            {
               name: 'Livro Caixa',
               href: routes.cashBook,
            },
         ],
      },


   ];
