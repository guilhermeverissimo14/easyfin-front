import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';
import AuthProvider from '@/app/api/auth/[...nextauth]/auth-provider';
import GlobalDrawer from '@/app/shared/drawer-views/container';
import GlobalModal from '@/app/shared/modal-views/container';
import { JotaiProvider, ThemeProvider } from '@/app/shared/theme-provider';
import { siteConfig } from '@/config/site.config';
import { inter, lexendDeca } from '@/app/fonts';
import NextProgress from '@core/components/next-progress';
import cn from '@core/utils/class-names';

// styles
import 'swiper/css';
import 'swiper/css/navigation';
import '@/app/globals.css';
import { ImportLoadingProvider } from '@/components/modal/global-import-loading';

export const metadata = {
   title: siteConfig.title,
   description: siteConfig.description,
};

export default async function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   const session = await getServerSession(authOptions);

   return (
      <html lang="en" dir="ltr" suppressHydrationWarning>
         <body
            suppressHydrationWarning
            className={cn(inter.variable, lexendDeca.variable, 'font-inter')}
         >
            <AuthProvider session={session}>
               <ThemeProvider>
                  <ImportLoadingProvider>
                     <NextProgress />
                     <JotaiProvider>
                        {children}
                        <ToastContainer />
                        <GlobalDrawer />
                        <GlobalModal />
                     </JotaiProvider>
                  </ImportLoadingProvider>
               </ThemeProvider>
            </AuthProvider>
         </body>
      </html>
   );
}
