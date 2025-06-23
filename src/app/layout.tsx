import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Navigation from '@/components/layout/navigation';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Veloz - Professional Event Photography & Videography',
  description:
    'Professional event photography and videography with our unique team-based production model. Experience excellence, warmth, and agility in every shot.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
