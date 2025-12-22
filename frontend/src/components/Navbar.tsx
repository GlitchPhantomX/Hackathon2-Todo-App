'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, ListTodo } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-lg'
          : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#0E7490] to-[#14B8A6] transform group-hover:scale-110 transition-transform duration-300">
              <ListTodo className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-[#0E7490]">
              TaskMaster
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[#1E293B] hover:text-[#0E7490] font-medium transition-colors duration-200 relative group"
              >
                {link.name}

                {/* Underline Hover */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0E7490] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button
                  variant="outline"
                  className="px-5 py-2 hover:scale-105 transition-transform duration-200 border border-[#0E7490] text-[#0E7490] bg-white"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="px-5 py-2 bg-gradient-to-r from-[#0E7490] to-[#14B8A6] hover:from-[#0D9488] hover:to-[#0E7490] text-white hover:scale-105 transition-all duration-200 shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-[#F4F4F5] transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-[#0E7490]" />
            ) : (
              <Menu className="h-6 w-6 text-[#0E7490]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-3 bg-white border-t">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 rounded-lg text-[#1E293B] hover:bg-[#F4F4F5] font-medium transition-all duration-200 transform hover:translate-x-2"
              style={{
                animation: isOpen
                  ? `slideIn 0.3s ease-out ${index * 0.1}s both`
                  : 'none',
              }}
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Auth Buttons */}
          <div className="pt-4 space-y-3">
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button
                variant="outline"
                className="w-full py-3 border border-[#0E7490] text-[#0E7490]"
                style={{
                  animation: isOpen ? `slideIn 0.3s ease-out 0.3s both` : 'none',
                }}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setIsOpen(false)}>
              <Button
                className="w-full py-3 bg-gradient-to-r from-[#0E7490] to-[#14B8A6] hover:from-[#0D9488] hover:to-[#0E7490] text-white shadow-md"
                style={{
                  animation: isOpen ? `slideIn 0.3s ease-out 0.4s both` : 'none',
                }}
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </nav>
  );
}
