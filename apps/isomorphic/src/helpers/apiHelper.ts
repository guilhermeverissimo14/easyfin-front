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

          if (userRole === 'FINANCIAL') {
            window.location.href = '/user-financial';
          } else if (userRole === 'ADMIN' || userRole === 'MANAGER') {
            window.location.href = '/dashboard-admin';
          } else if (userRole === 'PILOT') {
            window.location.href = '/dashboard-pilot';
          } else if (userRole === 'LOCAL_MANAGER') {
            window.location.href = '/dashboard-local-manager';
          }
      }

      return null;
   }
};
