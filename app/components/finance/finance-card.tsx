type FinanceCardProps = {
  title: string;
  body: string;
  large?: boolean;
  children: React.ReactNode;
};

export function FinanceCard({ title, body, large = false, children }: FinanceCardProps) {
  return (
    <article className={`finance-card ${large ? "min-h-[315px]" : "min-h-[255px]"} rounded-[20px] bg-white p-5`}>
      <div className="flex h-[150px] items-center justify-center rounded-[16px] bg-[#f7fafc] p-4 md:h-[170px]">
        {children}
      </div>
      <h3 className="mt-5 text-[14px] font-semibold text-[#101828]">{title}</h3>
      <p className="mt-2 text-[12px] leading-5 text-[#667085]">{body}</p>
    </article>
  );
}

export function MiniTransferVisual() {
  return (
    <div className="w-full max-w-[220px] rounded-[14px] bg-white p-3 shadow-[0_18px_40px_rgba(16,24,40,0.08)]">
      <div className="mb-3 h-3 w-16 rounded-full bg-[#111827]" />
      {["USD", "EUR"].map((currency) => (
        <div key={currency} className="mb-2 flex items-center justify-between rounded-[10px] border border-[#e8eef4] p-2">
          <span className="text-[10px] font-semibold text-[#667085]">{currency}</span>
          <span className="h-2 w-14 rounded-full bg-[#dbeafe]" />
        </div>
      ))}
      <div className="mt-3 h-7 rounded-full bg-[#05070d]" />
    </div>
  );
}

export function ChartVisual() {
  return (
    <div className="w-full max-w-[285px] rounded-[14px] bg-white p-4 shadow-[0_18px_40px_rgba(16,24,40,0.08)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-[#101828]">Revenue</span>
        <span className="text-[10px] text-[#98a2b3]">●</span>
      </div>
      <div className="mb-4 text-xl font-bold text-[#101828]">$45,728.89</div>
      <div className="flex h-24 items-end gap-2">
        {[26, 54, 70, 96, 46, 61, 34, 72].map((height, index) => (
          <span
            key={`${height}-${index}`}
            className={`flex-1 rounded-t-md ${index === 3 ? "bg-[#0a86d8]" : "bg-[#d9e2ea]"}`}
            style={{ height }}
          />
        ))}
      </div>
    </div>
  );
}

export function EnvelopeVisual() {
  return <div className="mail-visual" />;
}

export function MapVisual() {
  return (
    <div className="relative size-[150px] rounded-[18px] border border-[#e6edf4] bg-white">
      <span className="absolute left-7 top-10 size-3 rounded-full bg-[#0a86d8]" />
      <span className="absolute right-9 top-8 size-3 rounded-full bg-[#22c55e]" />
      <span className="absolute bottom-8 left-16 size-3 rounded-full bg-[#f97316]" />
      <div className="absolute inset-8 rounded-full border border-dashed border-[#b6c9d8]" />
      <div className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#eaf7ff] text-[10px] font-semibold text-[#0a86d8]">
        Global
      </div>
    </div>
  );
}

export function LogoCloudVisual() {
  return (
    <div className="grid w-[180px] grid-cols-4 gap-3">
      {["🇺🇸", "🇪🇺", "🇬🇧", "🇨🇦", "🇯🇵", "🇦🇺", "🇧🇷", "🇮🇳"].map((flag) => (
        <span key={flag} className="grid size-9 place-items-center rounded-full bg-white shadow-sm">
          {flag}
        </span>
      ))}
    </div>
  );
}
