export function SuiMark({ light = false }: { light?: boolean }) {
  const color = light ? "#fff" : "#298DFF";
  return (
    <svg className="brand-sui-mark" viewBox="0 0 48 62" aria-hidden="true">
      <path
        d="M24 4C18 14 6 25 6 39c0 10.8 8.3 18.5 18 18.5S42 49.8 42 39C42 25 30 14 24 4Z"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M16 31c2.4 10 10 16.4 21 16"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
