'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/watch', label: 'Watch' },
  { href: '/blog', label: 'Blog' },
  { href: '/podcast', label: 'Podcast' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1E1E1E] shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#01BAB4] flex items-center justify-center font-extrabold text-[#0A0A0A] text-xs tracking-tighter">
            GG
          </div>
          <span className="font-bold text-white text-base tracking-tight group-hover:text-[#01BAB4] transition-colors">
            Gospel Grounded
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? 'text-[#01BAB4]'
                  : 'text-[#777] hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <Link
          href="/contact"
          className="hidden md:inline-flex items-center px-5 py-2 rounded-lg bg-[#01BAB4] text-[#0A0A0A] text-sm font-bold hover:bg-[#02CEC8] active:scale-95 transition-all"
        >
          Subscribe
        </Link>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[#888] hover:text-white p-1.5 rounded-lg hover:bg-[#1E1E1E] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-[#0D0D0D] border-t border-[#1E1E1E] px-6 py-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-[#777] hover:text-white hover:bg-[#1E1E1E] transition-colors"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center mt-2 px-4 py-3 rounded-xl bg-[#01BAB4] text-[#0A0A0A] text-sm font-bold hover:bg-[#02CEC8] transition-colors"
          >
            Subscribe
          </Link>
        </div>
      </div>
    </header>
  )
}
