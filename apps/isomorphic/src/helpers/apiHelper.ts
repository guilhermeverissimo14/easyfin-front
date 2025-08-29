import { toast } from "react-toastify";

export const apiCall = async <T>(request: () => Promise<T>): Promise<T | null> => {

   const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

   try {
      const response = await request();
      return response;
   } catch (error) {
      //console.error('Erro ao fazer a chamada à API:', error);
      toast.error((error as any).response?.data?.message || 'Erro ao fazer a chamada à API');
      if ((error as any)?.response?.status == 401 || (error as any).status == 401) {
         localStorage.clear();
         window.location.href = '/signin';
      }
      if ((error as any)?.response?.status == 403) {

          if (userRole === 'ADMIN' || userRole === 'USER') {
            window.location.href = '/dashboard-admin';
          }
      }

      return null;
   }
};
