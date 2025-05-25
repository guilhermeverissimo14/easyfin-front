'use client';

import cn from '@core/utils/class-names';
import Link from 'next/link';
import { SidebarMenu } from './sidebar-menu';
import Image from 'next/image';

export default function Sidebar({ className }: { className?: string }) {
   return (
      <aside
         className={cn('fixed bottom-0 start-0 z-50 h-full w-[270px] border-e-2 border-gray-100 bg-white dark:bg-gray-100/50 2xl:w-72', className)}
         style={{
            background: 'linear-gradient(to top left, #87cbf3 2%, rgba(255, 255, 255, 1) 50%)',
         }}
      >
         <div className="sticky top-0 z-40 bg-gray-0/10 px-6 pb-5 pt-5 dark:bg-gray-100/5 2xl:px-8 2xl:pt-6">
            <Link href={'/'} aria-label="" className="text-gray-800 hover:text-gray-900">
               <Image src="/images/logo_principal_comFundo.png" alt="Easyfin" width={200} height={60} style={{ maxWidth: 200, marginLeft: '12%' }} />
            </Link>
         </div>

         <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto">
            <SidebarMenu />

            <div className="absolute bottom-0 start-0 h-20 w-full bg-gradient-to-t from-white to-transparent dark:from-gray-100/50 dark:to-transparent">
               <div className="flex h-full items-center justify-center">Versão 1.0.0</div>
            </div>
         </div>
      </aside>
   );
}
