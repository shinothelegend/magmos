import { SubscribeForm } from "@/components/layout/subscribe-form";

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

const links = [
  {
    title: "Product",
    items: ["Streaming Payroll", "Cross-Border Payouts", "Bridge Home (CCTP)", "USDC Pools", "Developer API"],
  },
  {
    title: "Features",
    items: ["Real-Time Streams", "Per-Second Settlement", "Live Runway", "Pause & Resume", "Delegated Roles"],
  },
  {
    title: "Resources",
    items: ["Getting Started", "Docs", "Network Overview", "Guides", "Community"],
  },
];

const socials = [{ label: "X", Icon: XIcon, href: "https://x.com/sweemfinance" }];

export function Footer() {
  return (
    <footer className="bg-white px-6 pb-8 pt-16 md:px-12 lg:px-24">
      <div className="mx-auto w-full max-w-7xl">
      {/* top row */}
      <div className="grid gap-12 border-b border-border pb-12 md:grid-cols-[1fr_1.1fr] md:gap-20">
        {/* left */}
        <div>
          <h2 className="text-[33px] font-medium leading-[1.1] tracking-[-0.02em] text-[#101828] md:text-[42px]">
            Let&apos;s Stream Your<br />Payroll.
          </h2>
          {/* email subscribe */}
          <SubscribeForm />
          <p className="mt-3 text-[11px] text-[#98a2b3]">
            By subscribing you agree to with our{" "}
            <a href="#" className="underline text-[#667085]">Privacy Policy</a>
          </p>
        </div>

        {/* right: contact grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-8 pt-2">
          <div>
            <h4 className="text-[14px] font-semibold text-[#101828]">Location</h4>
            <p className="mt-2 text-[14px] leading-[1.7] text-[#667085]">Built on HashKey Chain</p>
          </div>
          <div>
            <h4 className="text-[14px] font-semibold text-[#101828]">Email</h4>
            <a href="mailto:support.sweem@gmail.com" className="mt-2 block text-[14px] leading-[1.7] text-[#667085] hover:text-[#101828]">support.sweem@gmail.com</a>
          </div>
        </div>
      </div>

      {/* links row */}
      <div className="grid grid-cols-2 gap-8 border-b border-border py-12 md:grid-cols-4">
        {links.map(({ title, items }) => (
          <div key={title}>
            <h4 className="text-[13px] font-semibold text-[#101828]">{title}</h4>
            <ul className="mt-4 space-y-3">
              {items.map((item) => (
                <li key={item}>
                  <a href="#" className="text-[13px] text-[#667085] hover:text-[#101828]">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* social */}
        <div>
          <h4 className="text-[13px] font-semibold text-[#101828]">Social Media</h4>
          <div className="mt-4 flex items-center gap-3">
            {socials.map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-9 place-items-center rounded-[9px] text-[#101828] transition-colors hover:text-[#475467]"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="flex flex-col items-start gap-4 pt-7 text-[14px] text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Magmos. All rights reserved.</span>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-text-primary">Terms of Service</a>
          <a href="#" className="hover:text-text-primary">Privacy Policy</a>
        </div>
      </div>
      </div>
    </footer>
  );
}
