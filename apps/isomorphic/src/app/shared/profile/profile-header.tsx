'use client';

import Image from 'next/image';
import { Title, Text } from 'rizzui';
import cn from '@core/utils/class-names';
import { userType } from '@/types';
import PencilIcon from '@core/components/icons/pencil';
import { useState } from 'react';
import ProfileModal from './profile-modal';

export default function ProfileHeader() {
   const user = JSON.parse(localStorage.getItem('eas:user') || '{}') as userType;
   const avatarSrc = user.avatar ? `/avatar/${user.avatar}` : null;
   const initials = user.name
      ? user.name
           .split(' ')
           .map((n: string) => n[0])
           .join('')
      : '';
   const [open, setOpen] = useState(false);

   const openModal = () => {
      setOpen(true);
   };

   return (
      <div>
         <div
            className={cn(
               '-mx-6 h-[100px] bg-gradient-to-r from-[#315b32] to-[#E0E0E0] @5xl:h-[150px] 3xl:-mx-8 3xl:h-[200px] 4xl:-mx-10 4xl:h-[250px]'
            )}
         />

         <div className="mx-auto w-full max-w-[1294px] @container @5xl:mt-0 @5xl:pt-4 sm:flex sm:justify-between">
            <div className="flex h-auto gap-4 sm:h-36">
               <div>
                  <div className="relative -top-1/3 aspect-square w-[110px] overflow-hidden rounded-full border-4 border-white bg-white shadow-profilePic @2xl:w-[130px] @5xl:-top-3/4 @5xl:w-[150px] md:border-[6px] 3xl:w-[200px]">
                     {avatarSrc ? (
                        <div
                           className="relative cursor-pointer hover:opacity-80"
                           onClick={openModal}
                        >
                           <Image
                              src={avatarSrc}
                              alt="profile-pic"
                              priority
                              className="object-cover"
                              width={250}
                              height={250}
                           />
                           <PencilIcon className="absolute bottom-8 left-1/2 h-8 w-8 -translate-x-1/2 transform opacity-0 transition-opacity duration-200 hover:opacity-100" />
                        </div>
                     ) : (
                        <div
                           className="flex h-full w-full cursor-pointer items-center justify-center bg-[#00801A] text-5xl font-bold text-white hover:opacity-80"
                           onClick={openModal}
                        >
                           {initials}
                           <PencilIcon className="absolute bottom-8 left-1/2 h-8 w-8 -translate-x-1/2 transform opacity-0 transition-opacity duration-200 hover:opacity-100" />
                        </div>
                     )}
                  </div>
               </div>
               <div className="pt-2.5">
                  <Title
                     as="h1"
                     className="text-lg font-bold capitalize leading-normal text-gray-900 @3xl:!text-xl 3xl:text-2xl"
                  >
                     {user.name}
                  </Title>
                  <Text className="text-xs text-gray-500 @3xl:text-sm 3xl:text-base">
                     {user.email}
                  </Text>
               </div>
            </div>
         </div>

         {open && <ProfileModal open={open} setOpen={setOpen} user={user} />}
      </div>
   );
}
