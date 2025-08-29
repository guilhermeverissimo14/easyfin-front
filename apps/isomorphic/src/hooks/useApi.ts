import { useEffect, useState } from 'react';
import { api } from '@/service/api';
import { redirect } from 'next/navigation';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface UseApiOptions<T> {
   method?: RequestMethod;
   body?: T;
}

const useApi = <T>(endpoint: string, options?: UseApiOptions<T>) => {
   const [data, setData] = useState<T | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [loading, setLoading] = useState<boolean>(true);

   useEffect(() => {

      const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

      const fetchData = async () => {
         setLoading(true);
         try {
            let response;

            switch (options?.method) {
               case 'POST':
                  response = await api.post<T>(endpoint, options.body);
                  break;
               case 'PUT':
                  response = await api.put<T>(endpoint, options.body);
                  break;
               case 'PATCH':
                  response = await api.patch<T>(endpoint, options.body);
                  break;
               case 'DELETE':
                  response = await api.delete<T>(endpoint);
                  break;
               case 'GET':
               default:
                  response = await api.get<T>(endpoint);
                  break;
            }

            setData(response.data);
         } catch (error) {
            console.error('Erro ao fazer a chamada à API:', error);
            setError(
               (error as any).response?.data?.message ||
               'Erro ao fazer a chamada à API'
            );
            if ((error as any)?.response?.status === 401) {
               localStorage.clear();
               redirect('/signin');
            }
            if ((error as any)?.response?.status === 403) {
               if (userRole === 'ADMIN' || userRole === 'USER') {
                  redirect('/dashboard-admin');
               }
            }
         } finally {
            setLoading(false);
         }
      };

      fetchData();
   }, [endpoint, options]);

   return { data, error, loading };
};

export default useApi;
