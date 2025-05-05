'use client';

import { useIsMounted } from '@core/hooks/use-is-mounted';
import HydrogenLayout from '@/layouts/hydrogen/layout';
import { FilterProvider } from '../contexts/filter-context';

type LayoutProps = {
   children: React.ReactNode;
};

export default function DefaultLayout({ children }: LayoutProps) {
   return <LayoutProvider>{children}</LayoutProvider>;
}

function LayoutProvider({ children }: LayoutProps) {
   const isMounted = useIsMounted();

   if (!isMounted) {
      return null;
   }

   return (
      <FilterProvider>
         <HydrogenLayout>{children}</HydrogenLayout>
      </FilterProvider>
   );
}
