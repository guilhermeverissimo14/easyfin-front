'use client';

import { Badge, ActionIcon } from 'rizzui';
import ProfileMenu from '@/layouts/profile-menu';
import RingBellSolidIcon from '@core/components/icons/ring-bell-solid';
import NotificationDropdown from './notification-dropdown';
import { useState } from 'react';
import { userType } from '@/types';

export default function HeaderMenuRight() {
   const [hasNotification, setHasNotification] = useState(false);
   const user = JSON.parse(localStorage.getItem('eas:user') || '{}') as userType;

   return (
      <div className="ms-auto grid shrink-0 grid-cols-2 items-center gap-2 text-gray-700 xs:gap-3 xl:gap-4">
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
