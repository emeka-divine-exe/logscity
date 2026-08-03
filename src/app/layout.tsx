import type { Metadata } from 'next';
import { Syne, Urbanist } from 'next/font/google';
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
        {children}
      </body>
    </html>
  );
}
