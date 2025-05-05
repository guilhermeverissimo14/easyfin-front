import { toast } from "react-toastify";
import { User } from '@/types';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '../api';

export const loginUser = async (
   email: string,
   password: string
): Promise<User | null> => {
   try {
      const response = await apiCall(() =>
         api.post<User>('/auth/login', { email, password })
      );

      if (!response) {
         toast.error('Erro ao fazer login');
         return null;
      }

      localStorage.setItem('eas:userId', response.data.user.id);
      localStorage.setItem('eas:token', response.data.token);
      localStorage.setItem('eas:user', JSON.stringify(response.data.user));
      localStorage.setItem('eas:isAuthenticated', 'true');

      return {
         id: response.data.user.id,
         token: response.data.token,
         user: response.data.user,
      };
   } catch (error) {
      throw error;
   }
};
