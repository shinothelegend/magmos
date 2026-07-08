function AvatarPlaceholder() {
  return (
    <div className="size-9 shrink-0 overflow-hidden rounded-full bg-[#e2e6ea]">
      <svg viewBox="0 0 36 36" width="36" height="36" fill="none" aria-hidden>
        <circle cx="18" cy="14" r="6" fill="#c5cdd8" />
        <ellipse cx="18" cy="30" rx="11" ry="7" fill="#c5cdd8" />
      </svg>
    </div>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="size-10 text-[#c5cdd8]" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="M21 15.5l-5-5L5 20.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type TestimonialCardProps =
  | {
      type: "image";
      brand?: string;
      bg?: string;
      image?: string;
    }
  | {
      type: "quote";
      logo?: React.ReactNode;
      quote: string;
      name: string;
      role: string;
      light?: boolean;
      avatar?: string;
      href?: string;
    };

export function TestimonialCard(props: TestimonialCardProps) {
  if (props.type === "image") {
    return (
      <div
        className="relative flex h-full min-h-[240px] w-full items-end overflow-hidden rounded-[20px]"
        style={{ background: props.bg ?? "#dce8f0" }}
      >
        {props.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={props.image} alt={props.brand ?? ""} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <ImagePlaceholderIcon />
          </div>
        )}
        {props.brand ? (
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-[#101828] backdrop-blur-sm">
            <span className="size-2 rounded-full bg-[#101828]" />
            {props.brand}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col justify-between rounded-[20px] p-5 ${props.light ? "bg-[#f7f8fa]" : "bg-white ring-1 ring-[#eef0f3]"}`}>
      <div>
        {props.logo ? <div className="mb-4">{props.logo}</div> : null}
        <p className="text-[14px] leading-[1.6] text-[#1a2535]">{props.quote}</p>
      </div>
      <a
        href={props.href ?? undefined}
        target={props.href ? "_blank" : undefined}
        rel={props.href ? "noreferrer" : undefined}
        className={`mt-5 flex items-center gap-2.5 border-t border-[#f0f2f5] pt-4 ${props.href ? "transition-opacity hover:opacity-80" : ""}`}
      >
        {props.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.avatar}
            alt={props.name}
            referrerPolicy="no-referrer"
            className="size-9 shrink-0 rounded-full bg-[#e2e6ea] object-cover"
          />
        ) : (
          <AvatarPlaceholder />
        )}
        <div>
          <p className="text-[12px] font-semibold text-[#101828]">{props.name}</p>
          <p className="text-[11px] text-[#98a2b3]">{props.role}</p>
        </div>
      </a>
    </div>
  );
}
