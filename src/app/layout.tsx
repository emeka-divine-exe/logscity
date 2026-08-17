import type { Metadata } from 'next';
import { Syne, Urbanist } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const urbanist = Urbanist({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://logscity.vercel.app'),
  title: {
    default: 'LogsCity — Digital Accounts, Delivered Instantly',
    template: '%s',
  },
  description:
    'Buy social media accounts, VPN accounts, and more — delivered instantly after payment. No waiting, no back and forth.',
  openGraph: {
    title: 'LogsCity — Digital Accounts, Delivered Instantly',
    description:
      'Buy social media accounts, VPN accounts, and more — delivered instantly after payment.',
    url: 'https://logscity.vercel.app',
    siteName: 'LogsCity',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'LogsCity' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LogsCity — Digital Accounts, Delivered Instantly',
    description:
      'Buy social media accounts, VPN accounts, and more — delivered instantly after payment.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${urbanist.variable} bg-background font-body text-white antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
