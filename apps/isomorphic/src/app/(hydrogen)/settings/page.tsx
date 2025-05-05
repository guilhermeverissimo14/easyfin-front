import PageHeader from '@/app/shared/page-header';
import SettingsDetails from '@/app/shared/settings/settings-details';
import { metaObject } from '@/config/site.config';

export const metadata = {
   ...metaObject('Settings'),
};

const pageHeader = {
   title: 'Configurações',
   breadcrumb: [
      {
         href: '/',
         name: 'Home',
      },
      {
         name: 'Configurações',
      },
   ],
};

export default function SettingsPage() {
   return (
      <>
         <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
         <SettingsDetails />
      </>
   );
}
