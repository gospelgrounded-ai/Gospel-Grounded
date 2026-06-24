import type { Metadata } from 'next'
import { Youtube, Instagram, Facebook, Music, Heart } from 'lucide-react'
import ContactForm from '@/components/ContactForm'
import NewsletterForm from '@/components/NewsletterForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch, send a prayer request, or join the Gospel Grounded newsletter.',
}

const socials = [
  { icon: Youtube, label: 'YouTube', handle: '@GospelGrounded', href: '#' },
  { icon: Instagram, label: 'Instagram', handle: '@gospelgrounded', href: '#' },
  { icon: Facebook, label: 'Facebook', handle: 'Gospel Grounded', href: '#' },
  { icon: Music, label: 'Spotify', handle: 'Gospel Grounded Podcast', href: '#' },
]

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(1,186,180,0.10) 0%, transparent 65%)',
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.18em] mb-3">Contact</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Get in Touch</h1>
          <p className="text-[#666] max-w-xl leading-relaxed">
            Have a question, a prayer request, or want to collaborate? I&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-10">
          {/* Contact Form */}
          <div className="md:col-span-3">
            <ContactForm />
          </div>

          {/* Sidebar */}
          <div className="md:col-span-2 space-y-5">
            {/* Newsletter signup */}
            <div
              id="newsletter"
              className="bg-[#141414] border border-[#01BAB4]/15 rounded-2xl p-6"
              style={{ background: 'linear-gradient(135deg, rgba(1,186,180,0.05) 0%, #141414 60%)' }}
            >
              <h3 className="font-bold text-white mb-1">Join the Newsletter</h3>
              <p className="text-sm text-[#555] mb-4 leading-relaxed">
                Weekly biblical insights straight to your inbox.
              </p>
              <NewsletterForm className="flex-col" />
            </div>

            {/* Social links */}
            <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-6">
              <h3 className="font-bold text-white mb-4">Follow Along</h3>
              <div className="space-y-3">
                {socials.map(({ icon: Icon, label, handle, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-3 group hover:text-[#01BAB4] transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] border border-[#252525] flex items-center justify-center text-[#444] group-hover:text-[#01BAB4] group-hover:border-[#01BAB4]/25 transition-colors">
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white group-hover:text-[#01BAB4] transition-colors">{label}</div>
                      <div className="text-xs text-[#444]">{handle}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Prayer note */}
            <div
              id="prayer"
              className="bg-[#141414] border border-[#252525] rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart size={16} className="text-[#01BAB4]" />
                <h3 className="font-bold text-white text-sm">Prayer Requests</h3>
              </div>
              <p className="text-xs text-[#555] leading-relaxed">
                I read every prayer request personally. Use the contact form above and select &ldquo;Prayer Request&rdquo; — I will pray for you by name.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
