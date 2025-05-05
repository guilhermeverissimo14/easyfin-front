import { ProducersType } from '@/types';
import { getUserBirthday } from '@/utils/format';
import { FaEnvelope, FaPhone, FaIdCard, FaBirthdayCake, FaUser } from 'react-icons/fa';

export const ListProducerDetails = ({
   producerDetails,
}: {
    producerDetails: ProducersType;
}) => {

   return (
      <div className="">
         <ul className="grid gap-4 p-5">
            <li className="flex items-center gap-2">
               <FaUser className="text-gray-700" />
               <span className="text-base font-bold text-gray-900">
                  Nome:
               </span>
               <span className="text-base text-gray-700">
                    {producerDetails.name}
               </span>
            </li>
            <li className="flex items-center gap-2">
               <FaUser className="text-gray-700" />
               <span className="text-base font-bold text-gray-900">
                  Apelido:
               </span>
               <span className="text-base text-gray-700">
                    {producerDetails.surname}
               </span>
            </li>
            <li className="flex items-center gap-2">
               <FaEnvelope className="text-gray-700" />
               <span className="text-base font-bold text-gray-900">
                  E-mail:
               </span>
                  <span className="text-base text-gray-700">
                    {producerDetails.email?.length > 20
                      ? `${producerDetails.email.substring(0, 17)}...`
                      : producerDetails.email}
                  </span>
            </li>
            <li className="flex items-center gap-2">
               <FaPhone className="text-gray-700" />
               <span className="text-base font-bold text-gray-900">
                  Telefone:
               </span>
               <span className="text-base text-gray-700">
                  {producerDetails.phone ? producerDetails.phone : 'Não informado'}
               </span>
            </li>

            <li className="flex items-center gap-2">
               <FaIdCard className="text-gray-700" />
               <span className="text-base font-bold text-gray-900">
                  CPF:
               </span>
               <span className="text-base text-gray-700">
                  {producerDetails.cpf ? producerDetails.cpf : 'Não informado'}
               </span>
            </li>
         </ul>

      </div>
   );
};
