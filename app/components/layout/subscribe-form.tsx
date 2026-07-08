"use client";

import { useState } from "react";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M5 12.5 9.5 17 19 6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="mt-7 flex max-w-[380px] items-center gap-2.5 rounded-full bg-white py-2.5 pl-2.5 pr-5 ring-1 ring-[#e5e7eb]">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#ff6a1a] text-[#0a0e16]">
          <CheckIcon />
        </span>
        <span className="text-[13px] font-medium text-[#101828]">Thanks for subscribing!</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (EMAIL_RE.test(email.trim())) setDone(true);
      }}
      className="mt-7 flex max-w-[380px] items-center rounded-full bg-white py-1.5 pl-1.5 pr-1.5 ring-1 ring-[#e5e7eb]"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#0a0e16] text-white">
        <MailIcon />
      </span>
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        aria-label="Email address for newsletter"
        autoComplete="email"
        required
        className="min-w-0 flex-1 bg-transparent pl-2.5 text-[13px] text-[#667085] outline-none placeholder:text-[#b0b8c4]"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-[#0a0e16] px-5 py-2.5 text-[12px] font-medium text-white"
      >
        Subscribe
      </button>
    </form>
  );
}
