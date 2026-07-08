type ImagePlaceholderProps = {
  className?: string;
  iconSize?: string;
};

export function ImagePlaceholder({ className = "", iconSize = "size-10" }: ImagePlaceholderProps) {
  return (
    <div className={`grid place-items-center ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className={`${iconSize} text-[#c5cdd8]`}
        aria-hidden
      >
        <rect x="3" y="4" width="18" height="16" rx="2.5" />
        <circle cx="8.5" cy="9.5" r="1.6" />
        <path d="M21 15.5l-5-5L5 20.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
