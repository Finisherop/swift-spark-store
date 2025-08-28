import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'E-Commerce Store',
    template: '%s | E-Commerce Store',
  },
  description: 'Discover amazing products with the best deals and fast shipping.',
  keywords: ['e-commerce', 'shopping', 'products', 'deals'],
  authors: [{ name: 'E-Commerce Store' }],
  creator: 'E-Commerce Store',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://your-domain.com',
    title: 'E-Commerce Store',
    description: 'Discover amazing products with the best deals and fast shipping.',
    siteName: 'E-Commerce Store',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-Commerce Store',
    description: 'Discover amazing products with the best deals and fast shipping.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              duration={4000}
            />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}