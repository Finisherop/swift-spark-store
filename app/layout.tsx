import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/hooks/useAuth' // ✅ NextAuthProvider ko replace kiya
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { Toaster } from '@/components/ui/toaster'
import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { useState } from 'react'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export default function App({ Component, pageProps }: AppProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const router = useRouter()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleAdminClick = () => {
    router.push('/admin/login')
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider> {/* ✅ Wrap with correct AuthProvider */}
        <div className={`min-h-screen flex flex-col ${inter.className}`}>
          <Header
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onAdminClick={handleAdminClick}
          />
          <main className="flex-1">
            <Component {...pageProps} />
          </main>
          <Footer />
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}