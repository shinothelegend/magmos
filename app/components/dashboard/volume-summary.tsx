import { FlowerMascot } from "@/components/referral-card";

const defaultRows: [string, string][] = [
  ["Last 7 Days", "$0"],
  ["Last 30 Days", "$0"],
  ["This Year", "$0"],
];

const rowIcons = [
  // stack / total
  <path
    key="stack"
    d="M12 3 21 8l-9 5-9-5 9-5Zm-9 10 9 5 9-5"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
  />,
  // droplet / idle liquid
  <path
    key="drop"
    d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
  />,
  // trending up / yield
  <path
    key="trend"
    d="M4 15l5-5 4 4 7-7M16 7h4v4"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
];

export function VolumeSummary({
  title = "Past volume",
  rows = defaultRows,
  note = "Volume is in US Dollar",
}: {
  title?: string;
  rows?: [string, string][];
  note?: string;
}) {
  return (
    <aside className="relative flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-white p-5 font-sans shadow-[0_12px_40px_rgba(17,24,39,0.08)] ring-1 ring-black/[0.06]">
      <FlowerMascot className="pointer-events-none absolute -right-3 -top-3 h-[88px] w-[88px]" />

      <span className="inline-flex items-center rounded-full border-[1.5px] border-[#f4c4a0] bg-white px-2.5 py-[5px] text-[11px] font-semibold text-[#e8631c]">
        USDC
      </span>

      <h3 className="mt-4 text-[20px] font-bold leading-none tracking-[-0.02em] text-[#1d1d1f]">
        {title}
      </h3>

      <div className="mt-5 flex flex-col gap-[14px]">
        {rows.map(([label, value], i) => (
          <div className="flex items-center gap-3" key={label}>
            <span className="flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#ff9d5e] to-[#f1591a] text-white shadow-[0_2px_5px_rgba(241,89,26,0.35)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {rowIcons[i % rowIcons.length]}
              </svg>
            </span>
            <span className="text-[13px] font-medium text-[#2b2b2d]">{label}</span>
            <span className="ml-auto text-[13px] font-semibold tabular-nums text-[#1d1d1f]">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="mt-5 h-px w-full bg-[#f0f0f2]" />
        <p className="mt-3 text-[11px] text-[#a2a8b0]">{note}</p>
      </div>
    </aside>
  );
}
