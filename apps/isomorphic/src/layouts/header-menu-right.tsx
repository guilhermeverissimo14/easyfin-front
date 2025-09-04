'use client';

import ProfileMenu from '@/layouts/profile-menu';
import WelcomeMessage from '@/components/welcome/welcome-message';
import { useState } from 'react';
import { userType } from '@/types';

export default function HeaderMenuRight() {

   return (
      <div className="ms-auto flex shrink-0 items-center gap-3 text-gray-700 xs:gap-4 xl:gap-6">
         <WelcomeMessage className="hidden md:block" />
         
         {/* <NotificationDropdown setHasNotification={setHasNotification} userId={user.id}>
            <ActionIcon
               aria-label="Notification"
               variant="text"
               className="relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9"
            >
               <RingBellSolidIcon className="h-[18px] w-auto" />
               {hasNotification && (
                  <Badge renderAsDot color="warning" enableOutlineRing className="absolute right-2.5 top-2.5 -translate-y-1/3 translate-x-1/2" />
               )}
            </ActionIcon>
         </NotificationDropdown> */}

         <ProfileMenu />
      </div>
   );
}
