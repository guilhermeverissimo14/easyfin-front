'use client';
import React, { useEffect } from 'react';
import { redirect } from 'next/navigation';
import LoadingScreen from '@/components/loading';
import { useIsMounted } from '@core/hooks/use-is-mounted';

const Home = () => {
   const isMounted = useIsMounted();

   useEffect(() => {
      const isAuthenticated = localStorage.getItem('eas:isAuthenticated');
      const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;
      if (!isAuthenticated) {
         redirect('/signin');
      } else if (userRole === 'FINANCIAL') {
         redirect('/user-financial');
      } else if (userRole === 'ADMIN' || userRole === 'MANAGER') {
         redirect('/dashboard-admin');
      } else if (userRole === 'PILOT') {
         redirect('/dashboard-pilot');
      }else if (userRole === 'LOCAL_MANAGER') {
         redirect('/dashboard-local-manager');
      }
   }, [isMounted]);

   if (!isMounted) {
      return null;
   }

   return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
         <LoadingScreen />
      </main>
   );
};

export default Home;
