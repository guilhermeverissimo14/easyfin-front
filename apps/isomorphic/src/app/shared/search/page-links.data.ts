import { routes } from '@/config/routes';

// Note: do not add href in the label object, it is rendering as label
export const pageLinks = [
   {
      name: 'Visão Geral',
   },

   {
      name: 'Dashboard',
      // href: routes.dashboard,
   },

   {
      name: 'Usuários',
      href: routes.users,
   },

   {
      name: 'Operações',
   },

   {
      name: 'Serviços Ativos',
      href: routes.operational.services,
   },

   {
      name: 'Histórico de Contratos',
      href: routes.operational.contracts,
   },

   {
      name: 'Financeiro',
   },
];
