'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge, Checkbox, Modal, Popover, Text, Title } from 'rizzui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/pt-br';
import { PiCheck, PiBell, PiTrash } from 'react-icons/pi';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { Notifications, userType, WSNotification } from '@/types';
import Link from 'next/link';
import { routes } from '@/config/routes';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);
dayjs.locale('pt-br');

interface NotificationsListProps {
   setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
   setHasNotification: React.Dispatch<React.SetStateAction<boolean>>;
   userId: string;
}

function NotificationsList({ setIsOpen, setHasNotification, userId }: NotificationsListProps) {
   const audioRef = useRef<HTMLAudioElement | null>(null);
   const [notifications, setNotifications] = useState<Notifications[]>([]);
   const [lastNotifications, setLastNotifications] = useState<Notifications[]>([]);
   const [showAll, setShowAll] = useState(false);
   const [modalVisible, setModalVisible] = useState(false);
   const [selectedMessage, setSelectedMessage] = useState<string>('');

   const notificationSound = new Audio('/notification/bell.mp3');

   const getNotifications = async () => {
      let response;

      try {
         response = await apiCall(() => api.get<Notifications[]>('/notifications'));

         if (!response) {
            return;
         }

         if (!response.data.some((notification) => !notification.read)) {
            setHasNotification(false);
         }

         setNotifications(response.data);
         setLastNotifications(response.data.slice(0, 5));
      } catch (error) {
         console.log(error);
      }
   };

   const markAsRead = async (notificationId: string, message: string) => {
      try {
         setSelectedMessage(message);
         setModalVisible(true);

         await apiCall(() => api.put(`/notifications/${notificationId}/read`));
         setNotifications((prev) =>
            prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification))
         );

         setLastNotifications((prev) =>
            prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification))
         );

         if (notifications.every((notification) => notification.read)) {
            setHasNotification(false);
         }
      } catch (error) {
         console.log('Erro ao marcar notificação como lida:', error);
      }
   };

   const markAllAsRead = async () => {
      try {
         if (notifications.every((notification) => notification.read)) {
            return;
         }
         await apiCall(() => api.put('/notifications/read'));
         setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
         setHasNotification(false);
      } catch (error) {
         console.log('Erro ao marcar todas as notificações como lidas:', error);
      }
   };

   const removeNotification = async (notificationId: string) => {
      try {
         await apiCall(() => api.delete(`/notifications/${notificationId}`));
         setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
         setLastNotifications((prev) => prev.filter((notification) => notification.id !== notificationId));
      } catch (error) {
         console.log('Erro ao remover notificação:', error);
      }
   };

   useEffect(() => {
      getNotifications();
   }, []);

   useEffect(() => {
      audioRef.current = new Audio('/notification/bell.mp3');
      console.log('Audio ref:', audioRef.current);
   }, []);

   useEffect(() => {
      const ws = new WebSocket(`ws://https://minas-drones-api.onrender.com/ws?userId=${userId}`);

      ws.onopen = () => {
         //console.log('Conectado ao WebSocket');
      };

      ws.onmessage = (event) => {
         const notification: WSNotification = JSON.parse(event.data) as WSNotification;

         setNotifications((prev) => [
            ...prev,
            {
               id: notification.id,
               userId: notification.userId,
               senderId: notification.senderId,
               read: false,
               createdAt: notification.createdAt,
               message: notification.message,
            },
         ]);
         setLastNotifications((prev) => [
            {
               id: notification.id,
               userId: notification.userId,
               senderId: notification.senderId,
               read: false,
               createdAt: notification.createdAt,
               message: notification.message,
            },
            ...prev,
         ]);
         notificationSound.play();
         setHasNotification(true);
      };
   }, []);

   return (
      <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] rtl:text-right">
         <div className="mb-3 flex items-center justify-between ps-6">
            <Title as="h5" fontWeight="semibold">
               Notificações
            </Title>
            <Checkbox size="sm" label="Marque todas como lidas" labelWeight="normal" labelClassName="text-sm" onClick={markAllAsRead} />
         </div>
         <div className="custom-scrollbar max-h-[420px] overflow-y-auto scroll-smooth">
            <div className="grid cursor-pointer grid-cols-1 gap-1 ps-4">
               {(showAll ? notifications : lastNotifications).map((item, index) => (
                  <div
                     key={index}
                     className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50"
                     onClick={() => markAsRead(item.id, item.message)}
                  >
                     <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100/70 p-1 dark:bg-gray-50/50 [&>svg]:h-auto [&>svg]:w-5">
                        {item.read ? <PiCheck /> : <PiBell />}
                     </div>
                     <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                        <div className="w-full">
                           <Text
                              className={`mb-0.5 w-11/12 truncate text-sm font-semibold ${!item.read ? 'text-gray-900 dark:text-gray-700' : 'font-normal text-gray-600 dark:text-gray-400'}`}
                           >
                              {item.message}
                           </Text>
                           <Text className="ms-auto whitespace-nowrap pe-8 text-xs text-gray-500">{dayjs(item.createdAt).fromNow(true)}</Text>
                        </div>
                        <div className="ms-auto flex-shrink-0">
                           {!item.read ? (
                              <Badge renderAsDot size="lg" color="primary" className="scale-90" />
                           ) : (
                              <span className="inline-block rounded-full bg-gray-100 p-0.5 dark:bg-gray-50">
                                 <PiCheck className="h-auto w-[9px]" />
                              </span>
                           )}
                           <span
                              onClick={(e) => {
                                 e.stopPropagation();
                                 removeNotification(item.id);
                              }}
                              className="ml-4 inline-block rounded-full bg-gray-100 p-0.5 transition-colors hover:bg-red-500 dark:bg-gray-50 dark:hover:bg-red-50"
                           >
                              <PiTrash className="h-auto w-[9px] fill-red-500 transition-colors hover:fill-white dark:fill-red-500 dark:hover:fill-white" />
                           </span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
         <div className="mt-3 flex justify-center">
            <button onClick={() => setShowAll(!showAll)} className="-me-6 block px-6 pb-0.5 pt-3 text-center hover:underline">
               {showAll ? 'Ver apenas as últimas notificações' : 'Ver todas as notificações'}
            </button>
         </div>

         <Modal
            isOpen={modalVisible}
            onClose={() => setModalVisible(false)}
            overlayClassName="dark:bg-opacity-20 dark:bg-gray-50 dark:backdrop-blur-sm"
            containerClassName="dark:bg-gray-100/90 overflow-hidden dark:backdrop-blur-xl"
            className="z-[9999]"
         >
            <div className="p-4">
               <div className="flex items-center justify-between border-b pb-2">
                  <Title as="h3" fontWeight="semibold" className="text-lg">
                     Detalhes da Notificação
                  </Title>
               </div>
               <div className="mt-3">
                  <Text className="text-gray-800 dark:text-gray-900">{selectedMessage}</Text>
                    <Link
                     onClick={() => setModalVisible(false)}
                     className="mt-2 text-primary-dark underline" href={routes.production}>
                      Ver contrato
                    </Link>
               </div>
            </div>
         </Modal>
      </div>
   );
}
interface NotificationDropdownProps {
   children: React.ReactElement;
   setHasNotification: React.Dispatch<React.SetStateAction<boolean>>;
   userId: string;
}

export default function NotificationDropdown({ children, setHasNotification, userId }: NotificationDropdownProps) {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <Popover isOpen={isOpen} setIsOpen={setIsOpen} shadow="sm" placement="bottom-end">
         <Popover.Trigger>{children}</Popover.Trigger>
         <Popover.Content className="z-[9999] px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex">
            <NotificationsList setIsOpen={setIsOpen} setHasNotification={setHasNotification} userId={userId} />
         </Popover.Content>
      </Popover>
   );
}
