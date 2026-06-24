import Link from 'next/link'
import { Youtube, Instagram, Facebook, Music } from 'lucide-react'

const footerLinks = {
  Explore: [
    { href: '/watch', label: 'Watch Videos' },
    { href: '/blog', label: 'Blog' },
    { href: '/podcast', label: 'Podcast' },
    { href: '/about', label: 'About' },
  ],
  Resources: [
    { href: '/shop', label: 'Shop' },
    { href: '/blog', label: 'Free Articles' },
    { href: '/podcast', label: 'Podcast Archive' },
  ],
  Connect: [
    { href: '/contact', label: 'Contact' },
    { href: '/contact#prayer', label: 'Prayer Requests' },
    { href: '/contact#newsletter', label: 'Newsletter' },
  ],
}

const socials = [
  { href: '#', icon: Youtube, label: 'YouTube' },
  { href: '#', icon: Instagram, label: 'Instagram' },
  { href: '#', icon: Facebook, label: 'Facebook' },
  { href: '#', icon: Music, label: 'Spotify' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-14 border-b border-[#1A1A1A]">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#01BAB4] flex items-center justify-center font-extrabold text-[#0A0A0A] text-xs tracking-tighter">
                GG
              </div>
              <span className="font-bold text-white text-sm">Gospel Grounded</span>
            </Link>
            <p className="text-sm text-[#444] leading-relaxed mb-6">
              Rooted in Scripture.<br />Grounded in Truth.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#252525] flex items-center justify-center text-[#555] hover:text-[#01BAB4] hover:border-[#01BAB4]/30 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-[11px] font-semibold text-[#444] uppercase tracking-[0.15em] mb-5">
                {group}
              </h4>
              <ul className="space-y-3.5">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#555] hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#333]">
            © {new Date().getFullYear()} Gospel Grounded. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-[#333] hover:text-[#777] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-[#333] hover:text-[#777] transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
