import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { env } from '@/env.mjs';
import { pagesOptions } from './pages-options';

export const authOptions: NextAuthOptions = {
   debug: true,
   pages: {
      ...pagesOptions,
   },
   jwt: {
      secret: env.NEXTAUTH_SECRET,
   },
   session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 days
   },
   callbacks: {
      async session({ session, token }) {
         return {
            ...session,
            user: {
               ...session.user,
               id: token.idToken as string,
            },
         };
      },
      async jwt({ token, user }) {
         if (user) {
            token.user = user;
         }
         return token;
      },
      async redirect({ url, baseUrl }) {
         return '/';
      },
   },
   providers: [
      CredentialsProvider({
         id: 'credentials',
         name: 'Credentials',
         credentials: {
            id: {},
            name: {},
            email: {},
            token: {},
         },
         async authorize(credentials: any) {
            if (
               credentials.id &&
               credentials.email &&
               credentials.token &&
               credentials.name
            ) {
               return {
                  id: credentials.id,
                  name: credentials.name,
                  email: credentials.email,
                  token: credentials.token,
               };
            }

            return null;
         },
      }),
   ],
};
