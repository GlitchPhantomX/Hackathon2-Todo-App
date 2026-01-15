import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export function NewFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer 
      className="py-12 border-t"
      style={{ 
        backgroundColor: 'var(--background)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                  }}
                />
                <div 
                  className="relative h-10 w-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600), var(--purple-500))',
                  }}
                >
                  <CheckCircle2 className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <span 
                className="text-xl font-bold bg-clip-text text-transparent"
                style={{ 
                  backgroundImage: 'linear-gradient(to right, var(--purple-600), var(--violet-600))',
                  fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                }}
              >
                TodoMaster
              </span>
            </Link>
            <p 
              className="mb-6 max-w-sm leading-relaxed"
              style={{ color: 'var(--muted-foreground)' }}
            >
              The most intuitive task management app powered by AI.
              Stay organized, boost productivity, and never miss a deadline.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/#features" 
                  className="transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="/#how-it-works" 
                  className="transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link 
                  href="/#testimonials" 
                  className="transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link 
                  href="/#pricing" 
                  className="transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Account
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/login" 
                  className="transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link 
                  href="/register" 
                  className="transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  Get Started
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div 
          className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <p 
            className="text-sm text-center md:text-left"
            style={{ color: 'var(--muted-foreground)' }}
          >
            &copy; {currentYear} TodoMaster. All rights reserved.
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--primary)' }}
              />
              <span style={{ color: 'var(--muted-foreground)' }}>
                10K+ Active Users
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--primary)' }}
              />
              <span style={{ color: 'var(--muted-foreground)' }}>
                4.9/5 Rating
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}