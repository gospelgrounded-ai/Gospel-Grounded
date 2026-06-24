import type { Metadata } from 'next'
import { Play } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Watch',
  description: 'In-depth biblical video teachings on theology, Scripture, and the Gospel.',
}

const series = ['All', 'Romans Series', 'Gospel Foundations', 'Theology Basics', 'Prayer & Devotion', 'OT Survey']

const videos = [
  { id: '1', title: 'What Does It Really Mean to Be Saved?', series: 'Romans Series', duration: '18:42', views: '24K', date: 'Jun 20, 2026' },
  { id: '2', title: 'Understanding Grace vs. Works in Scripture', series: 'Theology Basics', duration: '22:15', views: '18K', date: 'Jun 13, 2026' },
  { id: '3', title: 'Why the Resurrection Changes Everything', series: 'Gospel Foundations', duration: '31:08', views: '41K', date: 'Jun 6, 2026' },
  { id: '4', title: 'The Role of the Holy Spirit in Sanctification', series: 'Theology Basics', duration: '26:50', views: '15K', date: 'May 30, 2026' },
  { id: '5', title: 'Justification by Faith — Romans 3:21–26', series: 'Romans Series', duration: '35:22', views: '29K', date: 'May 23, 2026' },
  { id: '6', title: 'How to Have a Life-Changing Quiet Time', series: 'Prayer & Devotion', duration: '14:30', views: '52K', date: 'May 16, 2026' },
  { id: '7', title: 'The Covenants of the Bible Explained', series: 'OT Survey', duration: '42:10', views: '33K', date: 'May 9, 2026' },
  { id: '8', title: "God's Wrath and God's Love — Are They Compatible?", series: 'Theology Basics', duration: '28:00', views: '21K', date: 'May 2, 2026' },
  { id: '9', title: 'What Is the Kingdom of God?', series: 'Gospel Foundations', duration: '19:45', views: '17K', date: 'Apr 25, 2026' },
]

export default function WatchPage() {
  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(1,186,180,0.10) 0%, transparent 65%)',
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto">
          <p className="text-[11px] text-[#01BAB4] font-semibold uppercase tracking-[0.18em] mb-3">
            Videos
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Watch & Learn
          </h1>
          <p className="text-[#666] max-w-xl leading-relaxed">
            Deep-dive video teachings on Scripture, theology, and the Gospel — designed to help you go beyond the surface.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap">
            {series.map((s, i) => (
              <button
                key={s}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  i === 0
                    ? 'bg-[#01BAB4] text-[#0A0A0A]'
                    : 'bg-[#141414] border border-[#252525] text-[#666] hover:text-white hover:border-[#333]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((v) => (
            <div
              key={v.id}
              className="group bg-[#141414] border border-[#1E1E1E] rounded-2xl overflow-hidden hover:border-[#01BAB4]/25 hover:-translate-y-0.5 transition-all"
            >
              <div className="aspect-video bg-[#1A1A1A] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E1E] to-[#0D0D0D]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#01BAB4] flex items-center justify-center shadow-lg shadow-[#01BAB4]/25 group-hover:scale-110 transition-transform">
                    <Play size={18} fill="#0A0A0A" className="text-[#0A0A0A] ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-medium">
                  {v.duration}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-[#01BAB4] font-semibold uppercase tracking-widest">
                    {v.series}
                  </span>
                  <span className="text-[#2A2A2A]">·</span>
                  <span className="text-[10px] text-[#444]">{v.views} views</span>
                </div>
                <h3 className="font-bold text-white text-sm leading-snug group-hover:text-[#01BAB4] transition-colors">
                  {v.title}
                </h3>
                <p className="text-xs text-[#444] mt-2">{v.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
