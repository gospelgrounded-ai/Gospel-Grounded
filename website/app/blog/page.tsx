import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Biblical articles, devotionals, and theology — written to help you go deeper in Scripture.',
}

const categories = ['All', 'Theology', 'Bible Study', 'Gospel', 'Devotional', 'Apologetics', 'Prayer']

const featured = {
  slug: 'romans-8-explained',
  category: 'Theology',
  title: 'Romans 8 Explained: No Condemnation, Full Adoption',
  excerpt:
    'There is therefore now no condemnation. Eight words that should stop every believer in their tracks. Romans 8 is arguably the most magnificent chapter in the entire Bible — and in this article, we walk through it verse by verse.',
  date: 'Jun 20, 2026',
  readTime: '14 min read',
}

const posts = [
  { slug: 'grace-truth-john', category: 'Theology', title: 'Understanding Grace and Truth in the Gospel of John', excerpt: 'What does it mean that grace and truth came through Jesus Christ? A deep dive into John 1.', date: 'Jun 12, 2026', readTime: '7 min read' },
  { slug: 'bible-study-guide', category: 'Bible Study', title: 'How to Study the Bible Effectively: A Complete Guide', excerpt: 'The inductive Bible study method that transformed how I read Scripture — and will for you too.', date: 'Jun 5, 2026', readTime: '10 min read' },
  { slug: 'resurrection-today', category: 'Gospel', title: 'What the Resurrection Really Means for Your Life Today', excerpt: "It's not just history — it's the living hope that changes how we work, suffer, and love.", date: 'May 28, 2026', readTime: '8 min read' },
  { slug: 'holy-spirit-sanctification', category: 'Theology', title: 'The Holy Spirit and Your Daily Walk with God', excerpt: 'Exploring the Spirit\'s role in conviction, comfort, and conforming us to Christ.', date: 'May 21, 2026', readTime: '9 min read' },
  { slug: 'prayer-Scripture', category: 'Prayer', title: 'How to Pray According to Scripture', excerpt: "Jesus gave us a model. Paul gave us a theology. Let's put both together.", date: 'May 14, 2026', readTime: '6 min read' },
  { slug: 'apologetics-faith', category: 'Apologetics', title: "Defending the Faith: Why Christianity Is Intellectually Credible", excerpt: 'A case for the historicity of the resurrection and the reliability of the New Testament.', date: 'May 7, 2026', readTime: '12 min read' },
]

export default function BlogPage() {
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
          <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.18em] mb-3">Articles</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Blog</h1>
          <p className="text-[#666] max-w-xl leading-relaxed">
            Theological depth, biblical clarity, and practical application — written to help you love God&apos;s Word.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          {categories.map((c, i) => (
            <button
              key={c}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                i === 0
                  ? 'bg-[#01BAB4] text-[#0A0A0A]'
                  : 'bg-[#141414] border border-[#252525] text-[#666] hover:text-white hover:border-[#333]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Featured Post */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/blog/${featured.slug}`}
            className="group block bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#01BAB4]/25 transition-all"
          >
            <div className="h-1 w-full bg-gradient-to-r from-[#01BAB4] via-[#01BAB4]/50 to-transparent" />
            <div className="p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="text-[10px] text-[#01BAB4] font-semibold uppercase tracking-widest border border-[#01BAB4]/20 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(1,186,180,0.06)' }}
                  >
                    {featured.category}
                  </span>
                  <span className="text-[11px] font-bold text-[#01BAB4] uppercase tracking-widest px-2 py-0.5 rounded bg-[#01BAB4]/10">
                    Featured
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold leading-tight mb-4 group-hover:text-[#01BAB4] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[#555] leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#444]">{featured.date}</span>
                  <span className="text-xs text-[#444]">{featured.readTime}</span>
                </div>
              </div>
              <div className="aspect-video bg-[#1A1A1A] rounded-xl border border-[#252525] flex items-center justify-center">
                <span className="text-[#333] text-sm">Featured image</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Post Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#01BAB4]/25 hover:-translate-y-0.5 transition-all"
            >
              <div className="h-0.5 w-full bg-gradient-to-r from-[#01BAB4] to-transparent" />
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-[10px] text-[#01BAB4] font-semibold uppercase tracking-widest border border-[#01BAB4]/20 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(1,186,180,0.06)' }}
                  >
                    {post.category}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base leading-snug mb-3 group-hover:text-[#01BAB4] transition-colors flex-1">
                  {post.title}
                </h3>
                <p className="text-sm text-[#555] leading-relaxed mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]">
                  <span className="text-xs text-[#444]">{post.date}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-[#01BAB4] font-medium">
                    Read <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
