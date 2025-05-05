import { userType } from '@/types';
import { getUserBirthday } from '@/utils/format';
import { FaEnvelope, FaPhone, FaIdCard, FaBirthdayCake } from 'react-icons/fa';

export const ListCardDetails = ({
   userDetails,
   convertRoles,
   pilots,
   birthdate,
}: {
   userDetails: userType;
   convertRoles: (role: string) => string;
   pilots: userType[];
   birthdate: string;
}) => {
   const calculatePilotAge = (date: string) => {
      const { birthdate } = getUserBirthday(date);
      return birthdate || 'Não informado';
   };

   return (
      <div className="rounded-lg border border-gray-300 bg-white shadow-lg">
         <ul className="grid gap-4 p-5">
            <li className="flex items-center gap-2">
               <FaIdCard className="text-gray-700" />
               <span className="text-base font-bold text-gray-900">
                  Função:
               </span>
               <span className="text-base text-gray-700">
                  {convertRoles(userDetails.role)}
               </span>
            </li>
            <li className="flex items-center gap-2">
               <FaEnvelope className="text-gray-700" />
               <span className="text-base font-bold text-gray-900">
                  E-mail:
               </span>
                  <span className="text-base text-gray-700">
                    {userDetails.email?.length > 20
                      ? `${userDetails.email.substring(0, 17)}...`
                      : userDetails.email}
                  </span>
            </li>
            <li className="flex items-center gap-2">
               <FaPhone className="text-gray-700" />
               <span className="text-base font-bold text-gray-900">
                  Telefone:
               </span>
               <span className="text-base text-gray-700">
                  {userDetails.phone ? userDetails.phone : 'Não informado'}
               </span>
            </li>

            <li className="flex items-center gap-2">
               <FaIdCard className="text-gray-700" />
               <span className="text-base font-bold text-gray-900">
                  CPF/CNPJ:
               </span>
               <span className="text-base text-gray-700">
                  {userDetails.cpfCnpj ? userDetails.cpfCnpj : 'Não informado'}
               </span>
            </li>
            <li className="flex items-center gap-2">
               <FaBirthdayCake className="text-gray-700" />
               <span className="text-base font-bold text-gray-900">
                  Aniversário:
               </span>
               <span className="text-base text-gray-700">{birthdate}</span>
            </li>
         </ul>

         {pilots && pilots.length > 0 && (
            <div className="m-5">
               <h3 className="mb-3 text-lg font-semibold">
                  Pilotos Vinculados
               </h3>
               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                  {pilots.map((pilot) => (
                     <div
                        key={pilot.id}
                        className="rounded-lg border border-gray-300 bg-white p-4 shadow-md transition-colors duration-300 hover:bg-gray-200"
                     >
                        <h4 className="text-md font-bold text-gray-800">
                           {pilot.name}
                        </h4>
                        <p className="text-gray-600">
                           Telefone: {pilot.phone || 'Não informado'}
                        </p>
                        <p className="text-gray-600">
                           Aniversário:{' '}
                           {calculatePilotAge(pilot.birthdate) ||
                              'Não informado'}
                        </p>
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};
