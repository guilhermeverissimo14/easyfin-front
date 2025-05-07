import { Avatar } from 'rizzui/avatar';

interface AvatarModalProps {
   name: string;
   details?: string;
}

export const AvatarModal = ({ name, details }: AvatarModalProps) => {
   return (
      <div className="flex items-center gap-3">
         <Avatar
            size="xl"
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=ffffff`}
            name={name}
         />
         <div>
            <h3>{name}</h3>
            {details && <span className="text-gray-600">{details}</span>}
         </div>
      </div>
   );
};
