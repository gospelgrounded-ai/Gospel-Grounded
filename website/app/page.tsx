import Link from 'next/link'
import { Play, ArrowRight, BookOpen, Headphones, ShoppingBag, ChevronDown } from 'lucide-react'
import NewsletterForm from '@/components/NewsletterForm'

const featuredVideos = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'What Does It Really Mean to Be Saved?',
    series: 'Romans Series',
    duration: '18:42',
    views: '24K',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Understanding Grace vs. Works in Scripture',
    series: 'Theology Basics',
    duration: '22:15',
    views: '18K',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Why the Resurrection Changes Everything',
    series: 'Gospel Foundations',
    duration: '31:08',
    views: '41K',
  },
]

const latestPosts = [
  {
    slug: 'understanding-grace-gospel-of-john',
    category: 'Theology',
    title: 'Understanding Grace and Truth in the Gospel of John',
    excerpt:
      'The Gospel of John opens with a stunning declaration — the Word became flesh. But what does that mean for how we understand grace?',
    date: 'Jun 12, 2026',
    readTime: '7 min read',
  },
  {
    slug: 'how-to-study-bible-effectively',
    category: 'Bible Study',
    title: 'How to Study the Bible Effectively: A Complete Guide',
    excerpt:
      'Most people want to read the Bible more deeply but don\'t know where to start. Here\'s the framework I use every day.',
    date: 'Jun 5, 2026',
    readTime: '10 min read',
  },
  {
    slug: 'resurrection-means-for-your-life',
    category: 'Gospel',
    title: 'What the Resurrection Really Means for Your Life Today',
    excerpt:
      'The resurrection isn\'t just a historical event — it\'s the foundation of everything we believe and how we live.',
    date: 'May 28, 2026',
    readTime: '8 min read',
  },
]

const stats = [
  { value: '150+', label: 'Videos' },
  { value: '80+', label: 'Articles' },
  { value: '50+', label: 'Podcast Episodes' },
  { value: '10K+', label: 'Community' },
]

export default function Home() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
        {/* Background layers */}
        <div className="absolute inset-0 bg-grid opacity-100" />
        <div className="absolute inset-0 bg-teal-glow" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0A0A]" />

        {/* Decorative orb */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(1,186,180,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 py-20">
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#01BAB4]/25 bg-[#01BAB4]/08 text-[#01BAB4] text-xs font-semibold uppercase tracking-[0.15em] mb-8"
            style={{ background: 'rgba(1,186,180,0.08)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#01BAB4] animate-pulse" />
            Faith · Theology · Gospel
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-extrabold leading-[0.95] tracking-[-0.03em] mb-6 text-balance">
            Rooted in
            <br />
            <span className="text-[#01BAB4]">Scripture.</span>
            <br />
            Grounded in Truth.
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-lg text-[#777] max-w-xl mx-auto mb-10 leading-relaxed">
            Deep, biblical teaching delivered through videos, articles, and podcasts — helping you understand God&apos;s Word with clarity and conviction.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/watch"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#01BAB4] text-[#0A0A0A] font-bold text-sm hover:bg-[#02CEC8] active:scale-95 transition-all shadow-lg shadow-[#01BAB4]/20"
            >
              <Play size={16} fill="currentColor" />
              Watch Videos
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-[#2A2A2A] text-white font-semibold text-sm hover:border-[#3A3A3A] hover:bg-[#141414] transition-all"
            >
              Read the Blog
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#333] animate-bounce">
          <ChevronDown size={18} />
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <section className="border-y border-[#1A1A1A] bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-extrabold text-[#01BAB4]">{value}</div>
              <div className="text-xs text-[#555] font-medium mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED VIDEOS ─── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.15em] mb-2">
                Latest
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Watch & Learn
              </h2>
            </div>
            <Link
              href="/watch"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#01BAB4] hover:text-[#02CEC8] transition-colors"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredVideos.map((v, i) => (
              <VideoCard key={i} {...v} />
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Link
              href="/watch"
              className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-[#252525] text-sm font-semibold text-[#777] hover:text-white hover:border-[#333] transition-colors"
            >
              View All Videos <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── BLOG ─── */}
      <section className="py-24 px-6 bg-[#0D0D0D] border-y border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.15em] mb-2">
                Articles
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                From the Blog
              </h2>
            </div>
            <Link
              href="/blog"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#01BAB4] hover:text-[#02CEC8] transition-colors"
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {latestPosts.map((post) => (
              <BlogCard key={post.slug} {...post} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT TEASER ─── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Photo placeholder */}
            <div className="relative aspect-[4/5] max-w-sm mx-auto md:mx-0 rounded-2xl overflow-hidden border border-[#1E1E1E]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#141414] to-[#0D0D0D]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-[#01BAB4]/15 border border-[#01BAB4]/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-extrabold text-[#01BAB4]">W</span>
                  </div>
                  <p className="text-[#444] text-sm">Your photo here</p>
                </div>
              </div>
              {/* Decorative teal corner accent */}
              <div className="absolute top-0 left-0 w-24 h-1 bg-[#01BAB4]" />
              <div className="absolute top-0 left-0 w-1 h-24 bg-[#01BAB4]" />
            </div>

            {/* Text */}
            <div>
              <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.15em] mb-4">
                About
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-5 leading-tight">
                Teaching the Gospel with Clarity and Conviction
              </h2>
              <p className="text-[#666] leading-relaxed mb-4">
                Gospel Grounded exists to bring the timeless truth of Scripture into everyday life. Through in-depth video teachings, written articles, and a growing podcast, we dive deep into God&apos;s Word — not to skim the surface, but to be truly grounded.
              </p>
              <p className="text-[#666] leading-relaxed mb-8">
                Whether you&apos;re a new believer or a seasoned student of the Bible, there&apos;s something here for you. Every piece of content is created to help you know Jesus more deeply.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#141414] border border-[#252525] text-white font-semibold text-sm hover:border-[#01BAB4]/40 hover:text-[#01BAB4] transition-colors"
              >
                My Story <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PODCAST TEASER ─── */}
      <section className="py-24 px-6 bg-[#0D0D0D] border-y border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.15em] mb-2">
                Podcast
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Listen on the Go
              </h2>
            </div>
            <Link
              href="/podcast"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#01BAB4] hover:text-[#02CEC8] transition-colors"
            >
              All Episodes <ArrowRight size={15} />
            </Link>
          </div>

          {/* Latest episode card */}
          <div className="bg-[#141414] border border-[#252525] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-[#01BAB4]/20 transition-colors">
            <div className="w-20 h-20 rounded-xl bg-[#01BAB4] flex items-center justify-center shrink-0">
              <Headphones size={32} className="text-[#0A0A0A]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-[#01BAB4] font-semibold uppercase tracking-widest">
                  Ep. 52
                </span>
                <span className="text-xs text-[#444]">·</span>
                <span className="text-xs text-[#444]">Jun 20, 2026</span>
                <span className="text-xs text-[#444]">·</span>
                <span className="text-xs text-[#444]">45 min</span>
              </div>
              <h3 className="text-xl font-bold mb-2 leading-snug">
                How the Holy Spirit Helps Us Understand Scripture
              </h3>
              <p className="text-sm text-[#555] leading-relaxed">
                In this episode we explore the role of the Holy Spirit as our Teacher and Guide into all truth — and what that means for how we read and apply the Bible.
              </p>
            </div>
            <Link
              href="/podcast"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#01BAB4] text-[#0A0A0A] font-bold text-sm hover:bg-[#02CEC8] transition-colors"
            >
              <Play size={14} fill="currentColor" />
              Listen
            </Link>
          </div>

          {/* Platform badges */}
          <div className="mt-6 flex flex-wrap gap-3">
            {['Spotify', 'Apple Podcasts', 'YouTube Music', 'Amazon Music'].map((p) => (
              <a
                key={p}
                href="#"
                className="px-4 py-2 rounded-lg bg-[#141414] border border-[#252525] text-xs font-medium text-[#666] hover:text-white hover:border-[#333] transition-colors"
              >
                {p}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER CTA ─── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(1,186,180,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#01BAB4]/20 mb-6"
            style={{ background: 'rgba(1,186,180,0.06)' }}>
            <BookOpen size={13} className="text-[#01BAB4]" />
            <span className="text-[#01BAB4] text-xs font-semibold uppercase tracking-widest">
              Free Newsletter
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Never Miss a Teaching
          </h2>
          <p className="text-[#666] mb-8 leading-relaxed">
            Get weekly biblical insights, new videos, and devotionals delivered straight to your inbox. No spam — just the Word.
          </p>
          <NewsletterForm className="max-w-md mx-auto" />
          <p className="text-xs text-[#444] mt-4">
            Join 10,000+ believers. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* ─── SHOP TEASER ─── */}
      <section className="py-16 px-6 border-t border-[#1A1A1A] bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#252525] flex items-center justify-center">
              <ShoppingBag size={22} className="text-[#01BAB4]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Resources & Study Materials</h3>
              <p className="text-sm text-[#555]">Books, courses, and downloadable guides to go deeper.</p>
            </div>
          </div>
          <Link
            href="/shop"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#252525] text-white font-semibold text-sm hover:border-[#01BAB4]/40 hover:text-[#01BAB4] transition-colors"
          >
            Browse Shop <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </>
  )
}

/* ─── SUB-COMPONENTS ─── */

function VideoCard({
  title,
  series,
  duration,
  views,
}: {
  id: string
  title: string
  series: string
  duration: string
  views: string
}) {
  return (
    <div className="group relative bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#01BAB4]/25 transition-all hover:-translate-y-0.5">
      {/* Thumbnail */}
      <div className="aspect-video bg-[#1A1A1A] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E1E] to-[#0D0D0D]" />
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#01BAB4] flex items-center justify-center shadow-lg shadow-[#01BAB4]/30 group-hover:scale-110 transition-transform">
            <Play size={20} fill="#0A0A0A" className="text-[#0A0A0A] ml-0.5" />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-medium">
          {duration}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-[#01BAB4] font-semibold uppercase tracking-widest">
            {series}
          </span>
          <span className="text-[#333]">·</span>
          <span className="text-[10px] text-[#444]">{views} views</span>
        </div>
        <h3 className="font-bold text-white text-sm leading-snug group-hover:text-[#01BAB4] transition-colors">
          {title}
        </h3>
      </div>
    </div>
  )
}

function BlogCard({
  slug,
  category,
  title,
  excerpt,
  date,
  readTime,
}: {
  slug: string
  category: string
  title: string
  excerpt: string
  date: string
  readTime: string
}) {
  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#01BAB4]/25 hover:-translate-y-0.5 transition-all"
    >
      {/* Colour bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#01BAB4] to-transparent" />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-[#01BAB4] font-semibold uppercase tracking-widest border border-[#01BAB4]/20 px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(1,186,180,0.06)' }}>
            {category}
          </span>
        </div>
        <h3 className="font-bold text-white text-base leading-snug mb-3 group-hover:text-[#01BAB4] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#555] leading-relaxed flex-1 mb-4">{excerpt}</p>
        <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]">
          <span className="text-xs text-[#444]">{date}</span>
          <span className="text-xs text-[#444]">{readTime}</span>
        </div>
      </div>
    </Link>
  )
}
