'use client';

import { Title, Text, Avatar, Button, Popover } from 'rizzui';
import cn from '@core/utils/class-names';
import { routes } from '@/config/routes';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { userType } from '@/types';

export default function ProfileMenu({
   buttonClassName,
   avatarClassName,
   username = false,
}: {
   buttonClassName?: string;
   avatarClassName?: string;
   username?: boolean;
}) {
   const [user, setUser] = useState<userType | null>(null);
   const [avatar, setAvatar] = useState<string | null>(null);

   useEffect(() => {
      const userCache = JSON.parse(localStorage.getItem('eas:user') || '{}') as userType;
      setUser(userCache);
      const avatarSrc = userCache.avatar ? `/avatar/${userCache.avatar}` : null;
      setAvatar(avatarSrc);
   }, []);

   return (
      <ProfileMenuPopover>
         <Popover.Trigger>
            <button
               className={cn(
                  'w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10',
                  buttonClassName
               )}
            >
               <Avatar
                  src={avatar ? avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=2da270&color=ffffff`}
                  name={user?.name || ''}
                  className={cn('!h-9 w-9 sm:!h-10 sm:!w-10', avatarClassName)}
               />
               {!!username && <span className="username hidden text-gray-200 dark:text-gray-700 md:inline-flex">Hi, Andry</span>}
            </button>
         </Popover.Trigger>

         <Popover.Content className="z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100">
            <DropdownMenu avatar={avatar} />
         </Popover.Content>
      </ProfileMenuPopover>
   );
}

function ProfileMenuPopover({ children }: React.PropsWithChildren<{}>) {
   const pathname = usePathname();
   const [isOpen, setIsOpen] = useState(false);

   useEffect(() => {
      setIsOpen(false);
   }, [pathname]);

   return (
      <Popover isOpen={isOpen} setIsOpen={setIsOpen} shadow="sm" placement="bottom-end">
         {children}
      </Popover>
   );
}

const menuItems = [
   {
      name: 'Meu Perfil',
      href: routes.profile,
   },
   {
      name: 'Alterar Senha',
      href: routes.changePassword,
   },
   {
      name: 'Configurações',
      href: routes.settings,
   },
];

function DropdownMenu({ avatar }: { avatar: string | null }) {
   const user = JSON.parse(localStorage.getItem('eas:user') || '{}') as userType;

   return (
      <div className="w-64 text-left rtl:text-right">
         <div className="flex items-center border-b border-gray-300 px-6 pb-5 pt-6">
            <Avatar
               src={avatar ? avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=2da270&color=ffffff`}
               name={user.name}
            />
            <div className="ms-3">
               <Title as="h6" className="font-semibold">
                  {user.name}
               </Title>
               <Text className="text-gray-600">{user?.email?.length > 20 ? `${user?.email.slice(0, 17)}...` : user.email}</Text>
            </div>
         </div>
         <div className="grid px-3.5 py-3.5 font-medium text-gray-700">
            {menuItems.map((item) => (
               <Link
                  key={item.name}
                  href={item.href}
                  className="group my-0.5 flex items-center rounded-md px-2.5 py-2 hover:bg-gray-100 focus:outline-none hover:dark:bg-gray-50/50"
               >
                  {item.name}
               </Link>
            ))}
         </div>
         <div className="border-t border-gray-300 px-6 pb-6 pt-5">
            <Button
               className="h-auto w-full justify-start p-0 font-medium text-gray-700 outline-none focus-within:text-gray-600 hover:text-gray-900 focus-visible:ring-0"
               variant="text"
               onClick={() => {
                  signOut();
                  localStorage.removeItem('eas:isAuthenticated');
                  localStorage.removeItem('eas:token');
                  localStorage.removeItem('eas:user');
                  localStorage.removeItem('eas:userId');
               }}
            >
               Sair
            </Button>
         </div>
      </div>
   );
}
