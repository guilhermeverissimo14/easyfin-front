'use client';

import cn from '@core/utils/class-names';
import Link from 'next/link';
import { SidebarMenu } from './sidebar-menu';
import Image from 'next/image';
import { useSidebar } from '@/app/contexts/sidebar-context';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { Tooltip } from 'rizzui';

export default function Sidebar({ className }: { className?: string }) {
   const { isCollapsed, toggleSidebar } = useSidebar();

   return (
      <aside
         className={cn(
            'fixed bottom-0 start-0 z-50 h-full border-e-2 border-gray-100 bg-white dark:bg-gray-100/50 transition-all duration-300',
            isCollapsed ? 'w-[80px]' : 'w-[270px] 2xl:w-72',
            className
         )}
         style={{
            background: 'linear-gradient(to top left, #87cbf3 2%, rgba(255, 255, 255, 1) 50%)',
         }}
      >
         <div className="sticky top-0 z-40 bg-gray-0/10 px-6 pb-5 pt-5 dark:bg-gray-100/5 2xl:px-8 2xl:pt-6">
            <div className="flex items-center justify-between">
               {!isCollapsed && (
                  <Link href={'/'} aria-label="" className="text-gray-800 hover:text-gray-900">
                     <Image 
                        src="/images/logo_principal_comFundo.png" 
                        alt="Easyfin" 
                        width={200} 
                        height={60} 
                        style={{ maxWidth: 200, marginLeft: '12%' }} 
                     />
                  </Link>
               )}
                  <button
                     onClick={toggleSidebar}
                     className={cn(
                        'flex h-8 w-8 mt-10 items-center justify-center rounded-md text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 hover:scale-105',
                        isCollapsed ? 'mx-auto bg-gray-50' : 'absolute -right-4 bg-white border border-gray-200 shadow-sm'
                     )}
                  >
                     {isCollapsed ? (
                        <PiCaretRight className="h-4 w-4" />
                     ) : (
                        <PiCaretLeft className="h-4 w-4" />
                     )}
                  </button>
            </div>
         </div>

         <div className="custom-scrollbar h-[calc(100%-80px)] overflow-y-auto">
            <SidebarMenu />
         </div>
      </aside>
   );
}
