'use client'

export default function NewsletterForm({ className = '' }: { className?: string }) {
  return (
    <form
      className={`flex flex-col sm:flex-row gap-3 ${className}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="your@email.com"
        className="flex-1 px-4 py-3 rounded-xl bg-[#141414] border border-[#252525] text-white text-sm placeholder:text-[#444] focus:outline-none focus:border-[#01BAB4]/50 transition-colors"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-xl bg-[#01BAB4] text-[#0A0A0A] font-bold text-sm hover:bg-[#02CEC8] active:scale-95 transition-all whitespace-nowrap"
      >
        Subscribe Free
      </button>
    </form>
  )
}
