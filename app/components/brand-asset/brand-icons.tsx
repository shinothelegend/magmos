export function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className="brand-arrow-icon"
      viewBox="0 0 24 24"
      fill="none"
      data-direction={direction}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocumentIcon() {
  return (
    <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none">
      <path d="M8 3h8l4 4v12H8V3Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 3v5h4M4 7h11v14H4V7Z" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
