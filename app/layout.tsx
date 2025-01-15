import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Anuphan } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';

export const metadata: Metadata = {
  title: 'Next.js Gold Saving',
  description: 'Get started quickly with Us',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const anuphan = Anuphan({ 
  subsets: ['thai', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userPromise = getUser();

  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${anuphan.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
      </body>
    </html>
  );
}