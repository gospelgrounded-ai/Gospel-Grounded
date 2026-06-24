import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpen, Heart, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About',
  description: 'Meet the voice behind Gospel Grounded — teaching Scripture with clarity and conviction.',
}

const beliefs = [
  {
    title: 'Scripture Alone',
    body: 'The Bible is the inspired, inerrant Word of God and the final authority for faith and life (2 Timothy 3:16–17).',
  },
  {
    title: 'The Gospel',
    body: 'Salvation is by grace alone, through faith alone, in Christ alone — His life, death, and resurrection for sinners (Ephesians 2:8–9).',
  },
  {
    title: 'The Trinity',
    body: 'There is one God eternally existing as three persons — Father, Son, and Holy Spirit — co-equal and co-eternal.',
  },
  {
    title: 'The Church',
    body: 'The Church is the body of Christ, called to make disciples, worship, and serve the world in His name.',
  },
]

const values = [
  { icon: BookOpen, title: 'Depth Over Clicks', body: 'We go deep into the text, not just skim the surface for engagement.' },
  { icon: Heart, title: 'Truth in Love', body: 'Hard truths delivered with pastoral care and genuine love for people.' },
  { icon: Users, title: 'Community Focus', body: 'Building a global community of believers growing in the Word together.' },
]

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(1,186,180,0.12) 0%, transparent 65%)',
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.18em] mb-4">
            About
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            The Voice Behind<br />
            <span className="text-[#01BAB4]">Gospel Grounded</span>
          </h1>
          <p className="text-[#666] text-lg max-w-2xl mx-auto leading-relaxed">
            A passion for Scripture, a heart for people, and a conviction that the Gospel changes everything.
          </p>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          {/* Photo */}
          <div className="relative aspect-[4/5] max-w-sm mx-auto rounded-2xl overflow-hidden border border-[#1E1E1E]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#141414] to-[#0D0D0D] flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-[#01BAB4]/12 border border-[#01BAB4]/20 flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(1,186,180,0.10)' }}>
                  <span className="text-4xl font-extrabold text-[#01BAB4]">W</span>
                </div>
                <p className="text-[#444] text-sm">Add your photo here</p>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-20 h-1 bg-[#01BAB4]" />
            <div className="absolute top-0 left-0 w-1 h-20 bg-[#01BAB4]" />
          </div>

          {/* Story */}
          <div>
            <h2 className="text-3xl font-extrabold mb-6">My Story</h2>
            <div className="space-y-4 text-[#666] leading-relaxed">
              <p>
                Gospel Grounded was born out of a simple conviction: too many people are reading the Bible on the surface, and too few are being equipped to go deep. I started this ministry because I believe the Word of God is not just a devotional tool — it&apos;s the very breath of God, meant to be studied, wrestled with, and lived.
              </p>
              <p>
                My journey with Scripture began early, but it was in my adult years that the richness of biblical theology came alive for me. I started studying not just what the Bible says, but why it says it — the covenants, the typology, the grand narrative of redemption running from Genesis to Revelation.
              </p>
              <p>
                What I discovered changed everything. And I want that for you too.
              </p>
              <p>
                Based in Australia, Gospel Grounded has grown into a community of believers from around the world who want the same thing: to be rooted in Scripture and grounded in the truth of the Gospel.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/watch"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#01BAB4] text-[#0A0A0A] font-bold text-sm hover:bg-[#02CEC8] transition-colors"
              >
                Watch Videos <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#252525] text-white font-semibold text-sm hover:border-[#333] hover:bg-[#141414] transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-[#0D0D0D] border-y border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.18em] mb-3">
              What Drives Us
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight">Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-6 hover:border-[#01BAB4]/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#01BAB4]/10 flex items-center justify-center mb-4"
                  style={{ background: 'rgba(1,186,180,0.08)' }}>
                  <Icon size={20} className="text-[#01BAB4]" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#555] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beliefs */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.18em] mb-3">
              Doctrine
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight">What We Believe</h2>
          </div>
          <div className="space-y-4">
            {beliefs.map(({ title, body }) => (
              <div
                key={title}
                className="flex gap-4 bg-[#141414] border border-[#1E1E1E] rounded-xl p-5 hover:border-[#01BAB4]/20 transition-colors"
              >
                <div className="w-1 rounded-full bg-[#01BAB4] shrink-0 my-0.5" />
                <div>
                  <h3 className="font-bold text-white mb-1.5">{title}</h3>
                  <p className="text-sm text-[#555] leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
