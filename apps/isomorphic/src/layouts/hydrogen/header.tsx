'use client';

import Link from 'next/link';
import Image from 'next/image';
import HamburgerButton from '@/layouts/hamburger-button';
import Sidebar from '@/layouts/hydrogen/sidebar';
import HeaderMenuRight from '@/layouts/header-menu-right';
import StickyHeader from '@/layouts/sticky-header';
import SearchWidget from '@/app/shared/search/search';
import Logo from '../../../public/logo/logo.png';

export default function Header() {
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
                  src="/images/Logo.png"
                  alt="Easyfin"
                  width={36}
                  height={10}
                  style={{ maxWidth: 40 }}
               /> 
            </Link>

            <SearchWidget />
         </div>

         <HeaderMenuRight />
      </StickyHeader>
   );
}
