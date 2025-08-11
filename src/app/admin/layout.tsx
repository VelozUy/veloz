'use client';

import {
  Inter,
  Roboto,
  Open_Sans,
  Poppins,
  Playfair_Display,
  Cormorant_Garamond,
  Cinzel,
  Libre_Baskerville,
  Montserrat,
  Raleway,
  Quicksand,
  Nunito,
  Oswald,
  Anton,
  Bebas_Neue,
  Lato,
  Source_Sans_3,
  Ubuntu,
  Work_Sans,
} from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

// Initialize Google Fonts for the admin title editor only
const inter = Inter({
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const roboto = Roboto({
  variable: '--font-roboto',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});

const openSans = Open_Sans({
  variable: '--font-open-sans',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const cinzel = Cinzel({
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const libreBaskerville = Libre_Baskerville({
  variable: '--font-libre-baskerville',
  weight: ['400', '700'],
  subsets: ['latin'],
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const raleway = Raleway({
  variable: '--font-raleway',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const quicksand = Quicksand({
  variable: '--font-quicksand',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const nunito = Nunito({
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const oswald = Oswald({
  variable: '--font-oswald',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const anton = Anton({
  variable: '--font-anton',
  weight: ['400'],
  subsets: ['latin'],
});

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas-neue',
  weight: ['400'],
  subsets: ['latin'],
});

const lato = Lato({
  variable: '--font-lato',
  weight: ['400', '700'],
  subsets: ['latin'],
});

const sourceSansPro = Source_Sans_3({
  variable: '--font-source-sans',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const ubuntu = Ubuntu({
  variable: '--font-ubuntu',
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});

const workSans = Work_Sans({
  variable: '--font-work-sans',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

interface AdminRootLayoutProps {
  children: ReactNode;
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return (
    <div
      className={`${inter.variable} ${roboto.variable} ${openSans.variable} ${poppins.variable} ${playfairDisplay.variable} ${cormorantGaramond.variable} ${cinzel.variable} ${libreBaskerville.variable} ${montserrat.variable} ${raleway.variable} ${quicksand.variable} ${nunito.variable} ${oswald.variable} ${anton.variable} ${bebasNeue.variable} ${lato.variable} ${sourceSansPro.variable} ${ubuntu.variable} ${workSans.variable}`}
    >
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
