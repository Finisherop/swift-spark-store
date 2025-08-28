import type { AppProps } from 'next/app'
import Head from 'next/head'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { NextAuthProvider } from '../components/NextAuthProvider'
import '../styles/globals.css'

const queryClient = new QueryClient()

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <NextAuthProvider>
          <Component {...pageProps} />
        </NextAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

