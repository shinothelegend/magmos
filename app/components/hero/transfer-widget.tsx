function FlagUS() {
  return (
    <span className="inline-grid size-4 overflow-hidden rounded-full ring-1 ring-black/5">
      <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden>
        <rect width="18" height="18" fill="#ffffff" />
        <g fill="#b22234">
          <rect y="0" width="18" height="1.4" />
          <rect y="2.8" width="18" height="1.4" />
          <rect y="5.6" width="18" height="1.4" />
          <rect y="8.4" width="18" height="1.4" />
          <rect y="11.2" width="18" height="1.4" />
          <rect y="14" width="18" height="1.4" />
          <rect y="16.6" width="18" height="1.4" />
        </g>
        <rect width="8" height="8" fill="#3c3b6e" />
      </svg>
    </span>
  );
}

function ChevronDown() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 16 L16 8 M9 8 h7 v7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Lightning({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" className={className} aria-hidden>
      <path d="M13 2 L4 14 h6 l-1 8 9-12 h-6 z" />
    </svg>
  );
}

function Shield() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M12 3 l7 3 v5 c0 4-3 6.8-7 8 -4-1.2-7-4-7-8 V6 z" strokeLinejoin="round" />
    </svg>
  );
}

function Receipt() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M6 3 h9 l3 3 v15 l-2.2-1.2 -2.2 1.2 -2.2-1.2 -2.2 1.2 V3 z" strokeLinejoin="round" />
      <path d="M9 8.5 h6 M9 12 h6 M9 15.5 h4" strokeLinecap="round" />
    </svg>
  );
}

function AmountField({ label }: { label: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] text-[#8a93a3]">{label}</p>
      <div className="flex items-center justify-between rounded-[12px] bg-[#f3f4f6] px-4 py-3">
        <span className="text-[20px] font-semibold tracking-tight text-[#101828]">532,680</span>
        <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#475467]">
          <FlagUS />
          USD
          <ChevronDown />
        </span>
      </div>
    </div>
  );
}

export function TransferWidget() {
  return (
    <div className="mx-auto w-[min(500px,calc(100vw-40px))]">
      <div className="overflow-hidden rounded-[26px] border border-white/40 bg-gradient-to-b from-[#4d95de] to-[#86bfef] p-2.5 shadow-[0_40px_90px_rgba(4,69,120,0.32)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-3 py-2.5 text-white">
          <span className="text-[15px] font-semibold">Transfer Money</span>
          <ArrowUpRight />
        </div>

        <div className="rounded-[20px] bg-white p-3.5">
          <div className="mb-3 flex items-center gap-3 rounded-[14px] border border-[#eaecf0] px-3 py-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#3b9be8] to-[#1c6fd0] text-white">
              <Lightning className="size-[18px]" />
            </span>
            <span className="text-[14px] font-semibold text-[#101828]">Trusted by World Bank USA</span>
          </div>

          <div className="rounded-[14px] border border-[#eaecf0] p-3.5">
            <AmountField label="You Sent Exactly" />

            <div className="-mx-3.5 my-3.5 flex items-start gap-2 border-y border-[#eef0f3] bg-[#fafbfc] px-3.5 py-2.5 text-[11px] leading-[1.5] text-[#667085]">
              <Shield />
              <span>
                Sending over 25,000 USD or equivalent?{" "}
                <a className="font-medium text-[#1c6fd0] underline" href="#home">
                  We&apos;ll discount our fee
                </a>
              </span>
            </div>

            <AmountField label="Recipient gets" />

            <div className="mt-3.5 flex items-center justify-between border-t border-[#eef0f3] pt-3.5">
              <div className="flex items-center gap-2.5">
                <Receipt />
                <div className="leading-tight">
                  <p className="text-[11px] text-[#8a93a3]">Total fees</p>
                  <p className="text-[12px] font-semibold text-[#101828]">Today - in seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Lightning className="size-5" />
                <div className="leading-tight">
                  <p className="text-[11px] text-[#8a93a3]">Arrives</p>
                  <p className="text-[12px] font-semibold text-[#101828]">Included in USD</p>
                </div>
              </div>
            </div>
          </div>

          <button className="mt-3.5 h-12 w-full rounded-full bg-[#0a0e16] text-[14px] font-semibold text-white">
            Send money
          </button>
        </div>
      </div>
    </div>
  );
}
