import ChangePassword from '@/app/shared/change-password/change-password';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';

export const metadata = {
   ...metaObject('Settings'),
};

const pageHeader = {
   title: 'Alterar Senha',
   breadcrumb: [
      {
         href: '/',
         name: 'Home',
      },
      {
         name: 'Alterar Senha',
      },
   ],
};

export default function SettingsPage() {
   return (
      <>
         <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
         <ChangePassword />
      </>
   );
}
