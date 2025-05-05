import { useEffect, useState } from 'react';

import { api } from '@/service/api';
import { ListCardDetails } from '@/components/card/card-list';
import { userType } from '@/types';
import { getStatusBadge } from '@core/components/table-utils/get-status-badge';
import AvatarCard from '@core/ui/avatar-card';
import { getUserBirthday } from '@/utils/format';

export const UserDetails = ({ id }: { id: string }) => {
   const [userDetails, setUserDetails] = useState<userType>({} as userType);
   const { birthdate, age } = getUserBirthday(userDetails.birthdate);

   useEffect(() => {
      const getUserDetails = async () => {
         try {
            const response = await api.get<userType>(`/users/${id}`);
            setUserDetails(response.data);
         } catch (error) {
            console.error('Erro ao buscar usuários:', error);
         }
      };
      getUserDetails();
   }, [id]);

   function convertRoles(role: string) {
      switch (role) {
         case 'ADMIN':
            return 'Administrador';
         case 'MANAGER':
            return 'Gerente';
         case 'LOCAL_MANAGER':
            return 'Gerente Local';
         case 'PILOT':
            return 'Piloto';
         default:
            return role;
      }
   }

   return (
      <main>
         <div className="mb-4 flex flex-row items-center justify-between">
            {userDetails.name ? (
               <AvatarCard
                  src={
                     userDetails.avatar
                        ? `/avatar/${userDetails.avatar}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(userDetails.name)}&background=97CFB7&color=ffffff`
                  }
                  name={userDetails.name}
                  description={age ? `${age} anos` : ''}
               />
            ) : (
               <p>Carregando...</p>
            )}
            <div className="w-24">{getStatusBadge(userDetails.active ?? false, userDetails.active ? "Ativo" : "Bloqueado")}</div>
         </div>

         <ListCardDetails
            userDetails={userDetails}
            convertRoles={convertRoles}
            pilots={userDetails.pilots}
            birthdate={birthdate || 'Não informado'}
         />
      </main>
   );
};
