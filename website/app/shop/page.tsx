import type { Metadata } from 'next'
import { ShoppingCart, Download, BookOpen, Video } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Books, courses, and downloadable study guides from Gospel Grounded.',
}

const categories = ['All', 'Bible Study Guides', 'Courses', 'Books', 'Free Downloads']

const products = [
  {
    id: '1',
    type: 'download',
    icon: Download,
    title: 'The Romans Study Guide',
    desc: 'A comprehensive verse-by-verse workbook covering all 16 chapters of Romans. 80 pages of questions, notes, and insights.',
    price: '$12',
    badge: 'Bestseller',
    badgeColor: '#01BAB4',
  },
  {
    id: '2',
    type: 'course',
    icon: Video,
    title: 'Biblical Theology 101',
    desc: '8-week video course walking through the grand narrative of Scripture from Creation to New Creation.',
    price: '$49',
    badge: 'New',
    badgeColor: '#4ADE80',
  },
  {
    id: '3',
    type: 'download',
    icon: Download,
    title: 'How to Study the Bible (Free)',
    desc: 'My complete inductive Bible study method in a beautifully designed PDF. Free for everyone.',
    price: 'Free',
    badge: 'Free',
    badgeColor: '#F59E0B',
  },
  {
    id: '4',
    type: 'book',
    icon: BookOpen,
    title: 'Gospel Foundations Journal',
    desc: 'A 90-day Scripture memory and journaling guide built around core Gospel passages.',
    price: '$24',
    badge: null,
    badgeColor: '',
  },
  {
    id: '5',
    type: 'course',
    icon: Video,
    title: 'Prayer That Transforms',
    desc: '4-week course on building a deep, Scripture-saturated prayer life. Includes workbook.',
    price: '$29',
    badge: null,
    badgeColor: '',
  },
  {
    id: '6',
    type: 'download',
    icon: Download,
    title: 'Sermon Outline Pack — Vol. 1',
    desc: '10 detailed sermon outlines on foundational Gospel texts, ready to preach or study.',
    price: '$18',
    badge: null,
    badgeColor: '',
  },
]

export default function ShopPage() {
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
          <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.18em] mb-3">Resources</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Shop</h1>
          <p className="text-[#666] max-w-xl leading-relaxed">
            Study guides, video courses, and books to help you go deeper in Scripture.
          </p>
        </div>
      </section>

      {/* Filter */}
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

      {/* Products Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.id}
                className="group flex flex-col bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#01BAB4]/25 hover:-translate-y-0.5 transition-all"
              >
                {/* Product image placeholder */}
                <div className="aspect-video bg-[#1A1A1A] flex items-center justify-center border-b border-[#1E1E1E] relative">
                  <Icon size={36} className="text-[#2A2A2A]" />
                  {p.badge && (
                    <span
                      className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg text-[#0A0A0A]"
                      style={{ background: p.badgeColor }}
                    >
                      {p.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-white text-base mb-2 group-hover:text-[#01BAB4] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-[#555] leading-relaxed flex-1 mb-5">{p.desc}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#1A1A1A]">
                    <span className="text-xl font-extrabold text-[#01BAB4]">{p.price}</span>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#01BAB4] text-[#0A0A0A] font-bold text-sm hover:bg-[#02CEC8] active:scale-95 transition-all">
                      <ShoppingCart size={14} />
                      {p.price === 'Free' ? 'Download' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
