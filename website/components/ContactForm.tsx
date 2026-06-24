'use client'

import { MessageSquare, Heart, Mail } from 'lucide-react'

const reasons = [
  { icon: MessageSquare, label: 'General Enquiry', value: 'general' },
  { icon: Heart, label: 'Prayer Request', value: 'prayer' },
  { icon: Mail, label: 'Media / Collaboration', value: 'media' },
]

export default function ContactForm() {
  return (
    <div className="bg-[#141414] border border-[#1E1E1E] rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-bold mb-6">Send a Message</h2>

      <div className="mb-5">
        <label className="block text-xs font-semibold text-[#555] uppercase tracking-widest mb-3">
          Reason
        </label>
        <div className="grid grid-cols-3 gap-2">
          {reasons.map(({ icon: Icon, label, value }) => (
            <button
              key={value}
              type="button"
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[#252525] bg-[#1A1A1A] text-[#555] hover:text-[#01BAB4] hover:border-[#01BAB4]/30 transition-colors text-xs font-medium"
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-widest mb-2">
              First Name
            </label>
            <input
              type="text"
              placeholder="Jane"
              className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#252525] text-white text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#01BAB4]/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#555] uppercase tracking-widest mb-2">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Smith"
              className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#252525] text-white text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#01BAB4]/50 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#555] uppercase tracking-widest mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="jane@email.com"
            className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#252525] text-white text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#01BAB4]/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#555] uppercase tracking-widest mb-2">
            Message
          </label>
          <textarea
            rows={5}
            placeholder="Your message..."
            className="w-full px-4 py-3 rounded-xl bg-[#1A1A1A] border border-[#252525] text-white text-sm placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#01BAB4]/50 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-[#01BAB4] text-[#0A0A0A] font-bold text-sm hover:bg-[#02CEC8] active:scale-[0.99] transition-all"
        >
          Send Message
        </button>
      </form>
    </div>
  )
}
