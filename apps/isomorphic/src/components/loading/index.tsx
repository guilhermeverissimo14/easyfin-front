import Logo from '../../../public/logo/logo.png';
import { useEffect, useState } from 'react';
import { Progressbar } from 'rizzui/progressbar';

const LoadingScreen = () => {
   const [value, setValue] = useState(0);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const interval = setInterval(() => {
         setValue((prevValue) => {
            const newValue = (prevValue + Math.floor(Math.random() * 10)) % 101;
            if (newValue >= 100) {
               clearInterval(interval);
               setIsLoading(false);
            }
            return newValue;
         });
      }, 1000);

      return () => clearInterval(interval);
   }, []);

   if (!isLoading) {
      return null;
   }

   return (
      <div className="absolute bottom-0 z-[30] flex h-[100vh] w-[100vw] flex-col items-center justify-center !bg-white">
         <div className="loading-screen__content__text">
            {/* <img src={Logo.src} alt="Logo" width={150} /> */}
         </div>
         <div className="mt-2 w-28">
            <p className="text-center">Carregando...</p>
            <Progressbar value={value} />
         </div>
      </div>
   );
};

export default LoadingScreen;
