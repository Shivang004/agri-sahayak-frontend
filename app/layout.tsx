import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AuthProvider } from '@/lib/AuthContext';
import { DataCacheProvider } from '@/lib/DataCacheContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agri Sahayak - Agricultural Assistant',
  description: 'AI-powered agricultural assistant for farmers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full flex flex-col`}>
        <AuthProvider>
          <LanguageProvider>
            <DataCacheProvider>
              {children}
            </DataCacheProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


