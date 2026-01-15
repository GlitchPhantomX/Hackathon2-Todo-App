'use client'
import { useState, useEffect } from 'react'
import { Moon, Sun, Menu, X, Sparkles, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'

export default function NewNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  const { theme, setTheme } = useTheme()

  // Fix hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!mounted) return null

  const toggleMenu = () => setIsOpen(!isOpen)

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'backdrop-blur-2xl shadow-lg border-b'
          : ''
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(var(--background-rgb, 255, 255, 255), 0.8)' : 'var(--background)',
        borderColor: scrolled ? 'var(--border)' : 'transparent',
        boxShadow: scrolled ? '0 10px 40px -10px var(--shadow-color, rgba(139, 92, 246, 0.1))' : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo with animated gradient */}
          <Link href="/new-dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))' }}
              ></div>
              <div className="relative h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
                style={{ 
                  background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600), var(--purple-500))',
                  boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.3)'
                }}
              >
                <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent transition-all duration-300"
                style={{ 
                  backgroundImage: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                }}
              >
                TodoMaster
              </span>
              <span className="text-[10px] font-medium -mt-1"
                style={{ color: 'var(--purple-400)' }}
              >
                Get things done ✨
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <div className="flex items-center space-x-1 rounded-full p-1.5 backdrop-blur-sm"
              style={{ backgroundColor: 'var(--secondary)' }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 group overflow-hidden"
                  style={{ color: 'var(--foreground)' }}
                >
                  <span className="relative z-10 group-hover:opacity-90">{link.name}</span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                    style={{ background: 'linear-gradient(to right, var(--purple-100), var(--violet-100))' }}
                  ></div>
                </Link>
              ))}
            </div>

            {/* Theme Toggle with animated icon */}
            <button
              onClick={toggleTheme}
              className="ml-4 p-2.5 rounded-full transition-all duration-300 group relative overflow-hidden"
              aria-label="Toggle theme"
              style={{ backgroundColor: 'var(--secondary)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to right, var(--purple-400), var(--violet-400))' }}
              ></div>
              <div className="relative">
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180"
                    style={{ color: 'var(--primary)' }}
                  />
                ) : (
                  <Moon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12"
                    style={{ color: 'var(--primary)' }}
                  />
                )}
              </div>
            </button>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3 ml-4">
              <Link href="/login">
                <button className="px-5 py-2.5 font-semibold transition-all duration-300 rounded-full hover:opacity-80"
                  style={{ 
                    color: 'var(--primary)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="relative px-6 py-2.5 text-white rounded-full font-semibold transition-all duration-500 shadow-lg hover:shadow-xl hover:scale-105 group overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))',
                    boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to right, var(--violet-600), var(--purple-600))' }}
                  ></div>
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-all duration-300"
              aria-label="Toggle theme"
              style={{ backgroundColor: 'var(--secondary)' }}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              ) : (
                <Moon className="h-5 w-5" style={{ color: 'var(--primary)' }} />
              )}
            </button>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-full transition-all duration-300"
              aria-label="Toggle menu"
              style={{ backgroundColor: 'var(--secondary)' }}
            >
              {isOpen ? (
                <X className="h-6 w-6" style={{ color: 'var(--primary)' }} />
              ) : (
                <Menu className="h-6 w-6" style={{ color: 'var(--primary)' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with enhanced styling */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-2 border-t backdrop-blur-xl"
          style={{ 
            background: 'linear-gradient(to bottom, var(--background), var(--secondary))',
            borderColor: 'var(--border)'
          }}
        >
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:translate-x-2 animate-slideDown"
              style={{ 
                color: 'var(--foreground)',
                animationDelay: `${index * 50}ms`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'var(--foreground)'
              }}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Auth Buttons */}
          <div className="pt-4 space-y-3 animate-slideUp animation-delay-200">
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <button className="w-full py-3 px-4 font-semibold rounded-xl border-2 transition-all duration-300"
                style={{ 
                  color: 'var(--primary)',
                  borderColor: 'var(--border)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Sign In
              </button>
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)}>
              <button className="w-full py-3 px-4 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                style={{ 
                  background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))',
                  boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.3)'
                }}
              >
                Get Started
                <Sparkles className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}