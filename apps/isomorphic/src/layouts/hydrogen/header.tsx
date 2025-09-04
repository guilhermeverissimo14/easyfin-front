'use client';

import Link from 'next/link';
import Image from 'next/image';
import HamburgerButton from '@/layouts/hamburger-button';
import Sidebar from '@/layouts/hydrogen/sidebar';
import HeaderMenuRight from '@/layouts/header-menu-right';
import StickyHeader from '@/layouts/sticky-header';
import SearchWidget from '@/app/shared/search/search';
import RealTimeClock from '@/components/clock/real-time-clock';
import { useSettings } from '@/contexts/SettingsContext';

export default function Header() {
   const { settings, loading } = useSettings();

   return (
      <StickyHeader className="z-[990] 2xl:py-5 3xl:px-8 4xl:px-10">
         <div className="flex w-full max-w-2xl items-center">
            <HamburgerButton
               view={<Sidebar className="static w-full 2xl:w-full" />}
            />
            <Link
               href={'/'}
               aria-label="Site Logo"
               className="me-4 w-9 shrink-0 text-gray-800 hover:text-gray-900 lg:me-5 xl:hidden"
            >
               <Image
                  src="/images/logo_principal.png"
                  alt="Easyfin"
                  width={36}
                  height={10}
                  style={{ maxWidth: 40 }}
               /> 
            </Link>

            <SearchWidget />
         </div>

         {/* Só exibe o relógio se showClock for true e não estiver carregando */}
         {!loading && settings?.showClock && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
               <RealTimeClock showSeconds={true} />
            </div>
         )}

         <HeaderMenuRight />
      </StickyHeader>
   );
}
