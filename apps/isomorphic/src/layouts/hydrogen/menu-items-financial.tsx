import { routes } from '@/config/routes';
import {
    PiCurrencyCircleDollarDuotone,
} from 'react-icons/pi';

export const menuItemsFinancial = [
    {
        name: 'Visão Geral',
    },

    {
        name: 'Aprovar gastos',
        href: routes.UserFinancial,
        icon: <PiCurrencyCircleDollarDuotone />,
    },
    {
        dropdownItems: [],
    },
];
