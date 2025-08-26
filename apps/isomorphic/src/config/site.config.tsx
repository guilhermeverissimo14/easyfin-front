import { Metadata } from 'next';
import logoImg from '@public/images/logo_principal.png';
import { LAYOUT_OPTIONS } from '@/config/enums';
import logoIconImg from '@public/images/logo_principal.png';
import { OpenGraph } from 'next/dist/lib/metadata/types/opengraph-types';

enum MODE {
   DARK = 'dark',
   LIGHT = 'light',
}

export const siteConfig = {
   title: 'Easyfin',
   description: `Easyfin Gestão`,
   logo: logoImg,
   icon: logoIconImg,
   mode: MODE.LIGHT,
   layout: LAYOUT_OPTIONS.HYDROGEN,
   // TODO: favicon
};

export const metaObject = (title?: string, openGraph?: OpenGraph, description: string = siteConfig.description): Metadata => {
   return {
      title: title ? `${title} - Easyfin` : siteConfig.title,
      description,
      openGraph: openGraph ?? {
         title: title ? `${title}` : title,
         description,
         url: 'https://easyfin-front-isomorphic.vercel.app/',
         siteName: 'Esyfin Gestão',
         images: {
            url: 'https://easyapp-api.mgioqc.easypanel.host/public/signin.png',
            width: 1200,
            height: 630,
         },
         locale: 'en_US',
         type: 'website',
      },
   };
};
