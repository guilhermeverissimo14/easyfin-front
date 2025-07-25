import { pagesOptions } from '@/app/api/auth/[...nextauth]/pages-options';
import withAuth from 'next-auth/middleware';

export default withAuth({
   pages: {
      ...pagesOptions,
   },
});

export const config = {
   matcher: [
      '/',
      '/dashboard',
      '/users',
      '/financial',
      '/settings',
      '/operational',
   ],
};
