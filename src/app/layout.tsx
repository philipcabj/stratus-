import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-archivo',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  title: 'Stratus — Panel Multicloud',
  description: 'Panel multicloud multi-tenant para partners y resellers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="font-plex-sans">{children}</body>
    </html>
  );
}
