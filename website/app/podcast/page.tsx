import type { Metadata } from 'next'
import { Play, Headphones } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Podcast',
  description: 'The Gospel Grounded Podcast — biblical teaching you can take anywhere.',
}

const platforms = [
  { name: 'Spotify', href: '#' },
  { name: 'Apple Podcasts', href: '#' },
  { name: 'YouTube Music', href: '#' },
  { name: 'Amazon Music', href: '#' },
  { name: 'Pocket Casts', href: '#' },
]

const episodes = [
  { ep: 52, title: 'How the Holy Spirit Helps Us Understand Scripture', desc: 'The Spirit as our Teacher and Guide into all truth — and what that means for daily Bible reading.', date: 'Jun 20, 2026', duration: '45 min' },
  { ep: 51, title: "God's Sovereignty and Human Responsibility — A False Dilemma?", desc: 'Reformed and Arminian perspectives examined through Scripture itself.', date: 'Jun 13, 2026', duration: '52 min' },
  { ep: 50, title: 'The Doctrine of Justification: Why It Still Matters', desc: "Luther called it the article by which the church stands or falls. We explore why he was right.", date: 'Jun 6, 2026', duration: '38 min' },
  { ep: 49, title: 'Prayer That Actually Works: Biblical Foundations', desc: 'Moving beyond rote prayer into genuine communion with God.', date: 'May 30, 2026', duration: '41 min' },
  { ep: 48, title: 'How to Read the Old Testament as a Christian', desc: 'Typology, promise-fulfillment, and the Christological reading of the Hebrew Scriptures.', date: 'May 23, 2026', duration: '49 min' },
  { ep: 47, title: 'What Does It Mean to Take Up Your Cross?', desc: "Unpacking one of Jesus' most challenging commands — and why it's actually good news.", date: 'May 16, 2026', duration: '35 min' },
]

export default function PodcastPage() {
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
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row gap-10 items-start md:items-end">
          <div className="flex-1">
            <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.18em] mb-3">Podcast</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Gospel Grounded Podcast</h1>
            <p className="text-[#666] max-w-xl leading-relaxed">
              In-depth biblical teaching designed for the commute, the gym, and the kitchen — wherever you are.
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap gap-2">
            {platforms.map((p) => (
              <a
                key={p.name}
                href={p.href}
                className="px-4 py-2 rounded-xl bg-[#141414] border border-[#252525] text-xs font-medium text-[#666] hover:text-white hover:border-[#333] transition-colors"
              >
                {p.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Episode Hero */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#141414] border border-[#01BAB4]/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center"
            style={{ background: 'linear-gradient(135deg, rgba(1,186,180,0.06) 0%, #141414 60%)' }}>
            <div className="w-20 h-20 rounded-2xl bg-[#01BAB4] flex items-center justify-center shrink-0">
              <Headphones size={32} className="text-[#0A0A0A]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-[#01BAB4] font-bold uppercase tracking-widest bg-[#01BAB4]/10 px-2 py-0.5 rounded">
                  Latest Episode
                </span>
                <span className="text-xs text-[#444]">Ep. 52 · Jun 20, 2026 · 45 min</span>
              </div>
              <h2 className="text-xl font-extrabold mb-2">How the Holy Spirit Helps Us Understand Scripture</h2>
              <p className="text-sm text-[#555] leading-relaxed">
                The Spirit as our Teacher and Guide into all truth — and what that means for how we read and apply the Bible every day.
              </p>
            </div>
            <button className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#01BAB4] text-[#0A0A0A] font-bold text-sm hover:bg-[#02CEC8] active:scale-95 transition-all">
              <Play size={16} fill="currentColor" />
              Play Now
            </button>
          </div>
        </div>
      </section>

      {/* Episode List */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold mb-5 text-[#888]">All Episodes</h2>
          <div className="space-y-3">
            {episodes.map((e) => (
              <div
                key={e.ep}
                className="group flex items-center gap-4 bg-[#141414] border border-[#1E1E1E] rounded-xl p-4 hover:border-[#01BAB4]/25 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#252525] flex items-center justify-center shrink-0 group-hover:bg-[#01BAB4] group-hover:border-transparent transition-colors">
                  <Play size={14} fill="currentColor" className="text-[#555] group-hover:text-[#0A0A0A] ml-0.5 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] text-[#444] font-medium">Ep. {e.ep}</span>
                    <span className="text-[10px] text-[#2A2A2A]">·</span>
                    <span className="text-[10px] text-[#444]">{e.date}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm leading-snug group-hover:text-[#01BAB4] transition-colors">
                    {e.title}
                  </h3>
                  <p className="text-xs text-[#444] mt-0.5 line-clamp-1">{e.desc}</p>
                </div>
                <span className="shrink-0 text-xs text-[#444] font-medium">{e.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
