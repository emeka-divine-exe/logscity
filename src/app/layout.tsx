import type { Metadata } from 'next';
import { Syne, Urbanist } from 'next/font/google';
import Script from 'next/script';
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
  title: 'LogsCity — Social accounts, delivered instantly',
  description:
    'Buy Facebook, Instagram, and TikTok pages by follower tier with instant digital delivery.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${urbanist.variable} bg-background font-body text-white antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-center" richColors />
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
