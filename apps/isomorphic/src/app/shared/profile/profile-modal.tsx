'use client';

import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { userType } from '@/types';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { PiXBold, PiEmpty, PiSpinner } from 'react-icons/pi';
import { ActionIcon } from 'rizzui/action-icon';
import { Modal } from 'rizzui/modal';
import { Title } from 'rizzui/typography';

type ProfileModal = {
   open: boolean;
   setOpen: (open: boolean) => void;
   user: userType;
};

const avatars = [
   'Nenhum',
   ...Array.from({ length: 15 }, (_, index) => `avatar-${index + 1}.webp`),
];

export default function ProfileModal({ open, setOpen, user }: ProfileModal) {
   const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
   const [loadingAvatar, setLoadingAvatar] = useState<string | null>(null);

   useEffect(() => {
      setSelectedAvatar(user.avatar);
   }, [user.avatar]);

   const handleSelectAvatar = async (avatar: string | null) => {
      setLoadingAvatar(avatar);

      try {
         const response =
            avatar !== 'Nenhum'
               ? await apiCall(() => api.put(`/users/${user.id}`, { avatar }))
               : await apiCall(() =>
                    api.put(`/users/${user.id}`, { avatar: null })
                 );

         if (!response) {
            return;
         }

         const updatedUser = { ...user, avatar: response.data.avatar };
         localStorage.setItem('eas:user', JSON.stringify(updatedUser));
         setSelectedAvatar(avatar);
         //window.location.reload();
      } catch (error) {
         console.error(error);
      } finally {
         setLoadingAvatar(null);
         setOpen(false);
      }
   };

   return (
      <div className="mx-auto mt-10 w-full max-w-[1294px] @2xl:mt-7 @6xl:mt-0">
         <div className="relative h-full lg:col-span-7">
            <Modal
               isOpen={open}
               onClose={() => setOpen(false)}
               className="[&>div]:p-0 lg:[&>div]:p-4"
               overlayClassName="dark:bg-opacity-40 dark:backdrop-blur-lg"
               containerClassName="dark:bg-gray-100 max-w-[460px] max-w-[1200px] lg:max-w-4xl xl:max-w-6xl 2xl:max-w-[1200px] relative"
            >
               <div className="m-auto w-full px-5 pb-8 pt-5 @lg:pt-6 @2xl:px-7 md:min-w-[500px]">
                  <div className="rounded-m mb-7 flex items-center justify-between">
                     <Title as="h4" className="font-semibold">
                        Escolha seu Avatar
                     </Title>
                     <ActionIcon
                        size="sm"
                        variant="text"
                        onClick={() => setOpen(false)}
                     >
                        <PiXBold className="h-auto w-5" />
                     </ActionIcon>
                  </div>
                  <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
                     {avatars.map((avatar, index) => (
                        <div
                           key={avatar}
                           className={`relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                              avatar === selectedAvatar
                                 ? 'border-4 border-green-600'
                                 : 'border-4 border-transparent'
                           } hover:border-gray-300`}
                           onClick={() => handleSelectAvatar(avatar)}
                        >
                           {loadingAvatar === avatar && (
                              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                                 <PiSpinner size="lg" color="white" />
                              </div>
                           )}
                           {avatar === 'Nenhum' ? (
                              <div className="flex h-full w-full flex-col items-center justify-center bg-gray-200 text-xl font-bold text-gray-700">
                                 <PiEmpty className="mb-2 h-12 w-12 text-gray-600" />{' '}
                                 {avatar}
                              </div>
                           ) : (
                              <Image
                                 src={`/avatar/${avatar}`}
                                 alt={`Avatar ${avatar}`}
                                 width={150}
                                 height={150}
                                 className="aspect-square object-cover"
                              />
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </Modal>
         </div>
      </div>
   );
}
