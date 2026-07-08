import Image from "next/image";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/magmos.png"
        alt="Magmos"
        width={30}
        height={30}
        priority
        className="h-[30px] w-[30px] object-contain"
      />
      <span
        style={{ fontFamily: "var(--font-display)" }}
        className={`text-[20px] font-bold tracking-[-0.02em] ${dark ? "text-white" : "text-[#101828]"}`}
      >
        Magmos
      </span>
    </div>
  );
}
