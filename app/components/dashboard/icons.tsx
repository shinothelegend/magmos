export type IconName =
  | "bank"
  | "billing"
  | "box"
  | "chevronDown"
  | "code"
  | "customer"
  | "developer"
  | "feedback"
  | "home"
  | "invoice"
  | "link"
  | "payment"
  | "plus"
  | "settings"
  | "support"
  | "user"
  | "grid"
  | "globe"
  | "bell"
  | "help"
  | "dollar"
  | "gift"
  | "upload"
  | "leaf"
  | "sparkle"
  | "team"
  | "info"
  | "search"
  | "warning"
  | "workerFill"
  | "expenseFill"
  | "milestoneFill"
  | "submissionFill"
  | "dataFill"
  | "clockFill"
  | "giftFill"
  | "uploadFill"
  | "warningFill"
  | "bankFill";

const paths: Record<IconName, React.ReactNode> = {
  bank: (
    <>
      <path d="M4 10.5h16" />
      <path d="M5.5 18h13" />
      <path d="M7 10.5v7.5M11 10.5v7.5M15 10.5v7.5" />
      <path d="m4.75 9 7.25-4 7.25 4" />
    </>
  ),
  billing: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M16.5 14.25h.01M12 14.25h.01M7.5 14.25h.01" />
    </>
  ),
  box: (
    <>
      <path d="m12 3.75 7.25 4.1v8.3L12 20.25l-7.25-4.1v-8.3L12 3.75Z" />
      <path d="M4.95 8 12 12l7.05-4M12 20v-8" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  code: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" />
      <path d="m10 9-3 3 3 3M14 9l3 3-3 3" />
    </>
  ),
  customer: (
    <>
      <path d="M16 19v-1.25c0-1.8-1.55-3.25-3.45-3.25h-5.1C5.55 14.5 4 15.95 4 17.75V19" />
      <circle cx="10" cy="8" r="3" />
      <path d="M20 19v-1.15a3.2 3.2 0 0 0-2.35-3.05M16.5 5.4a3 3 0 0 1 0 5.2" />
    </>
  ),
  developer: (
    <>
      <rect x="4.5" y="5" width="15" height="14" rx="2.5" />
      <path d="m10 9.5-2.5 2.5 2.5 2.5M14 9.5l2.5 2.5-2.5 2.5" />
    </>
  ),
  feedback: (
    <>
      <path d="m14.5 5.5 4 4" />
      <path d="M5 19h4l9.25-9.25a2.82 2.82 0 0 0-4-4L5 15v4Z" />
      <path d="M3.5 21h17" />
    </>
  ),
  home: (
    <>
      <path d="m4 10 8-6.5 8 6.5" />
      <path d="M6.5 9.5V19h11V9.5" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  invoice: (
    <>
      <path d="M6.5 4.5h11v15l-2-1.25-2 1.25-2-1.25-2 1.25-2-1.25-1 1.25v-15Z" />
      <path d="M9 8.5h6M9 12h6M9 15.5h4" />
    </>
  ),
  link: (
    <>
      <path d="M10.25 13.75a4.25 4.25 0 0 0 6.01.01l2.25-2.25a4.25 4.25 0 0 0-6.01-6.01l-1.3 1.3" />
      <path d="M13.75 10.25a4.25 4.25 0 0 0-6.01-.01L5.49 12.5a4.25 4.25 0 0 0 6.01 6.01l1.3-1.3" />
    </>
  ),
  payment: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17M7 15h2.5M16.5 15h.01" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  settings: (
    <>
      <path d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
      <path d="M19.2 13.45a7.6 7.6 0 0 0 .04-2.9l2-1.54-2-3.46-2.5 1a7.55 7.55 0 0 0-2.5-1.46L13.9 2.5h-3.8l-.35 2.59a7.55 7.55 0 0 0-2.5 1.46l-2.5-1-2 3.46 2 1.54a7.6 7.6 0 0 0 .04 2.9l-2.04 1.55 2 3.46 2.55-1a7.55 7.55 0 0 0 2.45 1.42l.35 2.62h3.8l.35-2.62a7.55 7.55 0 0 0 2.45-1.42l2.55 1 2-3.46-2.04-1.55Z" />
    </>
  ),
  support: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m7.8 7.8 2.85 2.85M16.2 7.8l-2.85 2.85M7.8 16.2l2.85-2.85M16.2 16.2l-2.85-2.85" />
      <circle cx="12" cy="12" r="2.35" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3" />
      <path d="M6.25 19c.5-3.05 2.45-4.6 5.75-4.6s5.25 1.55 5.75 4.6" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.75 12h16.5" />
      <path d="M12 3.75c2.2 2.2 3.4 5.15 3.4 8.25S14.2 18.05 12 20.25c-2.2-2.2-3.4-5.15-3.4-8.25S9.8 5.95 12 3.75Z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z" />
      <path d="M10.3 19a2 2 0 0 0 3.4 0" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6" />
      <path d="M12 17h.01" />
    </>
  ),
  dollar: (
    <>
      <path d="M12 3.5v17" />
      <path d="M15.5 7.2c-.7-1-2-1.7-3.5-1.7-2 0-3.5 1.1-3.5 2.8 0 3.8 7.2 1.9 7.2 5.9 0 1.8-1.7 2.9-3.7 2.9-1.7 0-3.1-.7-3.8-1.9" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9.5" width="16" height="11" rx="1.6" />
      <path d="M4 13h16M12 9.5v11" />
      <path d="M12 9.5S10.5 4.5 8 5.5s.5 4 4 4M12 9.5s1.5-5 4-4-.5 4-4 4" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V5M8 9l4-4 4 4" />
      <path d="M5 15v2.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V15" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-7 5-12 14-12 0 9-5 14-12 14-1 0-2-.2-2-2Z" />
      <path d="M5 19c2-4 5-6.5 9-8" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 4l1.7 4.6L18 10l-4.3 1.4L12 16l-1.7-4.6L6 10l4.3-1.4L12 4Z" />
      <path d="M18 15l.7 2 .3.7 2 .8-2 .7-.7 2-.7-2-2-.7 2-.8.7-2Z" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="9" r="2.75" />
      <circle cx="16.5" cy="10" r="2.25" />
      <path d="M3.75 18.5c.4-2.8 2.4-4.3 5.25-4.3s4.85 1.5 5.25 4.3" />
      <path d="M15 14.4c2.1.15 3.6 1.45 3.9 3.6" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  warning: (
    <>
      <path d="M12 4.5 21 19.5H3L12 4.5Z" />
      <path d="M12 10v4M12 17h.01" />
    </>
  ),
  workerFill: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 3.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5ZM4.75 19.4c0-3.27 3.3-5.65 7.25-5.65s7.25 2.38 7.25 5.65c0 .75-.6 1.35-1.35 1.35H6.1c-.75 0-1.35-.6-1.35-1.35Z"
    />
  ),
  expenseFill: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.5 5.5A2.5 2.5 0 0 0 1 8v8a2.5 2.5 0 0 0 2.5 2.5h17A2.5 2.5 0 0 0 23 16V8a2.5 2.5 0 0 0-2.5-2.5h-17ZM1 9.5v2h22v-2H1Zm5 4.5a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2H6Z"
    />
  ),
  milestoneFill: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 3a1 1 0 0 1 1 1v.5h11.2c.83 0 1.3.95.8 1.62L16 9l2.8 2.88c.5.67.03 1.62-.8 1.62H6V21a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Z"
    />
  ),
  submissionFill: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7 2.5h6.2c.4 0 .78.16 1.06.44l3.8 3.8c.28.28.44.66.44 1.06V20a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 20V4A1.5 1.5 0 0 1 7 2.5Zm6.5 1.9V7c0 .55.45 1 1 1h2.6L13.5 4.4ZM8.5 12.5a1 1 0 0 0 0 2h7a1 1 0 1 0 0-2h-7Zm0 4a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-4Z"
    />
  ),
  dataFill: (
    <path d="M12 2.3 2.5 7 12 11.7 21.5 7 12 2.3Zm7.3 8.1L12 14.1 4.7 10.4 2.5 11.5 12 16.2l9.5-4.7-2.2-1.1Zm0 4L12 18.1 4.7 14.4 2.5 15.5 12 20.2l9.5-4.7-2.2-1.1Z" />
  ),
  clockFill: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm.85 4.4a.85.85 0 0 0-1.7 0v5.05c0 .3.15.56.4.72l3.4 2.2a.85.85 0 1 0 .92-1.43l-3.02-1.95V6.9Z"
    />
  ),
  giftFill: (
    <path d="M20 11v8.5a1.5 1.5 0 0 1-1.5 1.5H13V11h7ZM11 21H5.5A1.5 1.5 0 0 1 4 19.5V11h7v10Zm9-11h-7V8h5.5A1.5 1.5 0 0 1 20 9.5V10Zm-9 0H4v-.5A1.5 1.5 0 0 1 5.5 8H11v2Zm.9-4H9.6c-.7 0-1.3-.4-1.6-1-.4-.9 0-2 .9-2.4.3-.1.6-.1.9 0 .9.4 1.6 1.6 2.1 3.4Zm.2 0c.5-1.8 1.2-3 2.1-3.4.3-.1.6-.1.9 0 .9.4 1.3 1.5.9 2.4-.3.6-.9 1-1.6 1h-2.3Z" />
  ),
  uploadFill: (
    <path d="M12 2.5 6.5 8H10v6h4V8h3.5L12 2.5ZM3 15a1 1 0 0 1 2 0v3.5c0 .28.22.5.5.5h13a.5.5 0 0 0 .5-.5V15a1 1 0 1 1 2 0v3.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5V15Z" />
  ),
  warningFill: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 3.3c.62 0 1.2.33 1.5.87l8.4 14.6c.66 1.15-.17 2.58-1.5 2.58H3.6c-1.33 0-2.16-1.43-1.5-2.58l8.4-14.6c.3-.54.88-.87 1.5-.87Zm-1 5.2v5a1 1 0 1 0 2 0v-5a1 1 0 1 0-2 0Zm1 9.6a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
    />
  ),
  bankFill: (
    <path d="M12 2.5 3 6.8V9h18V6.8L12 2.5ZM5 10.5H7.2V16.8H5V10.5ZM10.9 10.5H13.1V16.8H10.9V10.5ZM16.8 10.5H19V16.8H16.8V10.5ZM3.5 18H20.5A1 1 0 0 1 21.5 19V20.5H2.5V19A1 1 0 0 1 3.5 18Z" />
  ),
};

export function Icon({
  name,
  size = 20,
  strokeWidth = 2.35,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {paths[name]}
    </svg>
  );
}
