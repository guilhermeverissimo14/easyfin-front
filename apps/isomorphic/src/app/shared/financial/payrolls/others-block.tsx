import { UserData, userType } from '@/types';
import { PayrollInput } from '@/components/input/payroll-input';


export default function OthersBlock() {

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
      case 'FINANCIAL':
        return 'Financeiro';
      default:
        return role;
    }
  }

  const userSession: UserData = (() => {
    const storedUser = localStorage.getItem('eas:user');
    try {
      return storedUser ? JSON.parse(storedUser) as UserData : {} as UserData;
    } catch {
      return {} as UserData;
    }
  })();

  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 gap-0.5">
        <PayrollInput
          value="Minas Drones Ltda"
          inputClassName='hover:border-transparent'
          readOnly
        />
        <PayrollInput
          value="Avenida Alberto Caldeira, 155 - Centro"
          inputClassName='hover:border-transparent'
          readOnly
        />
        <PayrollInput
          value="CEP-39740-000 - Guanhães, MG"
          inputClassName='hover:border-transparent'
          readOnly
        />
      </div>

      <div className="ms-auto mt-12 grid w-full max-w-64 grid-cols-1 gap-1 [&_input]:text-center">
        {userSession && userSession.name && (
          <PayrollInput
            style={{ fontFamily: 'Dancing Script, cursive', fontSize: '32px' }}
            value={userSession?.name || ""}
            inputClassName="hover:border-transparent"
            className="font-semibold "
            readOnly
          />
        )}
        {userSession && userSession.role && (
          <PayrollInput
            value={convertRoles(userSession?.role) || ""}
            inputClassName='hover:border-transparent'
            className="border-t pt-1 dark:border-muted/20"
            readOnly
          />
        )}
      </div>
    </div>
  );
}
